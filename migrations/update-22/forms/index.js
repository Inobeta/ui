"use strict";

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { MigrationError, relativeImportPath } = require("../lib/engine");

const DEST_ROOT = "/src/app/core";
const FORMS_DESTINATION = `${DEST_ROOT}/forms/index.ts`;
const MATERIAL_FORMS_DESTINATION = `${DEST_ROOT}/material-forms/index.ts`;
const PAYLOAD_ROOT = path.join(__dirname, "..", "files");

// Generated from ui/forms/index.ts and ui/material-forms/index.ts.
const FORMS_SYMBOLS = [
  "IFormArrayOptions", "IFormArray", "IbFormArray", "IbCheckbox", "IbDropdown",
  "IbFormControlBase", "IbFormControlBaseParams", "IbFormControlInterface",
  "IbFormControlBaseComponent", "IbFormControlData", "IbRadio", "IbTextbox",
  "IbDynamicFormArrayComponent", "IbDynamicFormControlComponent", "IbFormAction",
  "IbDynamicFormComponent", "IbFormControlService", "IbDynamicFormsModule",
];

const MATERIAL_FORMS_SYMBOLS = [
  "IbMatAutocompleteComponent", "IbMatAutocompleteControl", "IbMatButtonComponent",
  "IbMatButtonControl", "IbMatButtonParams", "IbMatButtonData", "IbMatCheckboxComponent",
  "IbMatCheckboxControl", "IbMatDatepickerComponent", "IbMatDatepickerControl",
  "dateRequiredValidator", "IbMatDropdownComponent", "IbMatDropdownControl",
  "IbMatDropdownParams", "IbDropdownData", "IbMatLabelComponent", "IbMatLabelControl",
  "IbMatPaddingComponent", "IbMatPaddingControl", "IbMatRadioComponent",
  "IbMatRadioControl", "IbMatSlideToggleComponent", "IbMatSlideToggleControl",
  "IbMatTextareaComponent", "IbMatTextareaControl", "IbMatTextareaParams",
  "IbMatTextareaData", "IbMatTextboxComponent", "IbMatTextboxControl",
  "IbMatTextboxParams", "IbMatTextboxData", "IbMaterialFormArrayComponent",
  "IbFormControlDirective", "IbMaterialFormControlComponent", "IbMaterialFormTestModule",
  "ibMatDatepickerTranslate", "IbMaterialFormModule", "IbMatActionsPosition",
  "IbMaterialFormComponent", "IbMaterialFormStubComponent",
];

const FORM_SYMBOL_ROUTES = new Map(FORMS_SYMBOLS.map((symbol) => [symbol, FORMS_DESTINATION]));
const MATERIAL_SYMBOL_ROUTES = new Map(MATERIAL_FORMS_SYMBOLS.map((symbol) => [symbol, MATERIAL_FORMS_DESTINATION]));
const SYMBOL_ROUTES = new Map([...FORM_SYMBOL_ROUTES, ...MATERIAL_SYMBOL_ROUTES]);

function loadPayload(payloadRoot = PAYLOAD_ROOT) {
  const payload = {};
  for (const [name, destination] of [["forms", "/src/app/core/forms"], ["material-forms", "/src/app/core/material-forms"]]) {
    const root = path.join(payloadRoot, name);
    const walk = (directory, base) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const source = path.join(directory, entry.name);
        const target = path.posix.join(base, entry.name);
        if (entry.isDirectory()) walk(source, target);
        else payload[target] = fs.readFileSync(source, "utf8");
      }
    };
    walk(root, destination);
  }
  return payload;
}

function specifier(node) {
  return ts.isStringLiteral(node) ? node.text : undefined;
}

function renderImport(node, elements, moduleName, sourceFile) {
  const clause = node.importClause;
  const clauseNode = ts.factory.createImportClause(
    clause.isTypeOnly,
    undefined,
    ts.factory.createNamedImports(elements),
  );
  return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printNode(
    ts.EmitHint.Unspecified,
    ts.factory.createImportDeclaration(node.modifiers, clauseNode, ts.factory.createStringLiteral(moduleName), node.attributes),
    sourceFile,
  );
}

function planFile(file, content) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const diagnostics = [];
  const edits = [];
  const checkUnsupported = (node) => {
    if (ts.isImportDeclaration(node)) {
      const value = specifier(node.moduleSpecifier);
      if (value && value.startsWith("@inobeta/ui/")) diagnostics.push({ file, message: `unsupported deep import: ${value}` });
      if (value === "@inobeta/ui") {
        const clause = node.importClause;
        if (clause?.name) diagnostics.push({ file, message: "unsupported default import from @inobeta/ui" });
        if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) diagnostics.push({ file, message: "unsupported namespace import from @inobeta/ui" });
      }
    }
    if (ts.isCallExpression(node) && node.arguments[0]) {
      const value = specifier(node.arguments[0]);
      if (value === "@inobeta/ui" || value?.startsWith("@inobeta/ui/")) diagnostics.push({ file, message: `unsupported dynamic import: ${value}` });
    }
    ts.forEachChild(node, checkUnsupported);
  };
  checkUnsupported(sourceFile);

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || specifier(statement.moduleSpecifier) !== "@inobeta/ui") continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    const groups = new Map();
    for (const element of bindings.elements) {
      const original = element.propertyName?.text || element.name.text;
      const destination = SYMBOL_ROUTES.get(original);
      if (!destination) continue;
      if (!groups.has(destination)) groups.set(destination, []);
      groups.get(destination).push(element);
    }
    if (!groups.size) continue;
    if (!file.startsWith("/src/app/")) {
      diagnostics.push({ file, message: "unsupported cross-project import from @inobeta/ui" });
      continue;
    }
    const moved = new Set([...groups.values()].flat());
    const retained = bindings.elements.filter((element) => !moved.has(element));
    const replacements = retained.length ? [renderImport(statement, retained, "@inobeta/ui", sourceFile)] : [];
    for (const [destination, elements] of groups) replacements.push(renderImport(statement, elements, relativeImportPath(file, destination), sourceFile));
    edits.push({ start: statement.getStart(sourceFile), end: statement.end, text: replacements.join("\n") });
  }
  if (diagnostics.length) return { diagnostics };
  if (!edits.length) return undefined;
  let next = content;
  for (const edit of edits.reverse()) next = `${next.slice(0, edit.start)}${edit.text}${next.slice(edit.end)}`;
  return { file, content: next };
}

function treeFiles(tree) {
  const files = [];
  const visit = (entry) => {
    for (const file of entry.subfiles || []) files.push(path.posix.join(entry.path, file));
    for (const directory of entry.subdirs || []) visit(tree.getDir(path.posix.join(entry.path, directory)));
  };
  visit(tree.root);
  return files.sort();
}

function sameContent(left, right) { return Buffer.compare(Buffer.from(left), Buffer.from(right)) === 0; }

function createFormsFamily(payloadRoot) {
  return {
    name: "Forms",
    symbols: [...SYMBOL_ROUTES.keys()],
    routes: SYMBOL_ROUTES,
    destination: FORMS_DESTINATION,
    payload: loadPayload(payloadRoot),
    prompt: "Forms and Material Forms are being removed from @inobeta/ui. Vendor them locally?",
  };
}

async function migrateFormsFamily(tree, config = createFormsFamily(), prompts) {
  const diagnostics = [];
  const rewrites = [];
  for (const file of treeFiles(tree)) {
    if (!/\.[cm]?tsx?$/.test(file)) continue;
    const result = planFile(file, tree.readText(file));
    if (result?.diagnostics) diagnostics.push(...result.diagnostics);
    else if (result) rewrites.push(result);
  }
  if (diagnostics.length) throw new MigrationError("Preflight failed for Forms", diagnostics);
  if (!rewrites.length) return { status: "noop", plan: { rewrites, copies: [] } };

  const copies = [];
  for (const [file, content] of Object.entries(config.payload)) {
    const existing = tree.read(file);
    if (existing && !sameContent(existing, content)) diagnostics.push({ file, message: "destination collision has different content" });
    else if (!existing) copies.push({ path: file, content });
  }
  if (diagnostics.length) throw new MigrationError("Preflight failed for Forms", diagnostics);
  if (!prompts?.isInteractive) throw new MigrationError("Interactive confirmation required for Forms");
  if (!(await prompts.confirm(config.prompt))) return { status: "declined", plan: { rewrites, copies } };
  if (typeof tree.branch !== "function" || typeof tree.merge !== "function") throw new MigrationError("Tree does not support atomic branch commits");
  const staged = tree.branch();
  for (const copy of copies) staged.create(copy.path, copy.content);
  for (const rewrite of rewrites) staged.overwrite(rewrite.file, rewrite.content);
  tree.merge(staged);
  return { status: "migrated", plan: { rewrites, copies } };
}

module.exports = {
  DEST_ROOT, FORMS_DESTINATION, MATERIAL_FORMS_DESTINATION,
  FORMS_SYMBOLS, MATERIAL_FORMS_SYMBOLS, createFormsFamily, loadPayload, migrateFormsFamily,
};
