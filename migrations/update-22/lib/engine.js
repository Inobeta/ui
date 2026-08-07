"use strict";

const path = require("node:path");
const ts = require("typescript");
const { createNonInteractivePromptAdapter } = require("./prompt");

const PACKAGE_NAME = "@inobeta/ui";
const CONSUMER_ROOT = "/src/app";

class MigrationError extends Error {
  constructor(message, diagnostics) {
    super(message);
    this.name = "MigrationError";
    this.diagnostics = diagnostics || [];
  }
}

function posixPath(value) {
  return value.replace(/\\/g, "/");
}

function normalizeTreePath(value) {
  const normalized = path.posix.normalize(posixPath(value));
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function relativeImportPath(fromFile, destination) {
  const normalizedDestination = normalizeTreePath(destination);
  const barrelDirectory = path.posix.basename(normalizedDestination).replace(/\.(?:ts|tsx|mts|cts)$/i, "") === "index";
  const relative = path.posix.relative(
    path.posix.dirname(normalizeTreePath(fromFile)),
    barrelDirectory ? path.posix.dirname(normalizedDestination) : normalizedDestination
  );
  const withoutExtension = relative.replace(/\.(?:ts|tsx|mts|cts)$/i, "");
  return withoutExtension.startsWith(".") ? withoutExtension : `./${withoutExtension}`;
}

function diagnostic(file, message) {
  return { file, message };
}

function isConsumerFile(file) {
  return file === CONSUMER_ROOT || file.startsWith(`${CONSUMER_ROOT}/`);
}

function treeFiles(tree) {
  const files = [];
  const visit = (entry) => {
    for (const file of entry.subfiles || []) {
      files.push(normalizeTreePath(path.posix.join(entry.path, file)));
    }
    for (const directory of entry.subdirs || []) {
      visit(tree.getDir(path.posix.join(entry.path, directory)));
    }
  };
  visit(tree.root);
  return files.sort();
}

function payloadEntries(payload) {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload.map(({ path: file, content }) => ({ path: normalizeTreePath(file), content }));
  }
  return Object.entries(payload).map(([file, content]) => ({
    path: normalizeTreePath(file),
    content,
  }));
}

function sameContent(left, right) {
  return Buffer.compare(Buffer.from(left), Buffer.from(right)) === 0;
}

function packageSpecifier(node) {
  return ts.isStringLiteral(node) ? node.text : undefined;
}

function packageUseDiagnostics(sourceFile, file) {
  const diagnostics = [];
  const checkModule = (moduleSpecifier, kind) => {
    const value = packageSpecifier(moduleSpecifier);
    if (!value) {
      return;
    }
    if (value.startsWith(`${PACKAGE_NAME}/`)) {
      diagnostics.push(diagnostic(file, `unsupported deep ${kind}: ${value}`));
    }
  };

  const visit = (node) => {
    if (ts.isImportDeclaration(node)) {
      checkModule(node.moduleSpecifier, "import");
      if (packageSpecifier(node.moduleSpecifier) === PACKAGE_NAME) {
        const clause = node.importClause;
        if (clause && clause.name) {
          diagnostics.push(diagnostic(file, "unsupported default import from @inobeta/ui"));
        }
        if (clause && clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
          diagnostics.push(diagnostic(file, "unsupported namespace import from @inobeta/ui"));
        }
      }
    } else if (ts.isImportEqualsDeclaration(node)) {
      const reference = node.moduleReference;
      if (ts.isExternalModuleReference(reference)) {
        checkModule(reference.expression, "import equals");
        if (packageSpecifier(reference.expression) === PACKAGE_NAME) {
          diagnostics.push(diagnostic(file, "unsupported import equals from @inobeta/ui"));
        }
      }
    } else if (ts.isCallExpression(node) && node.arguments[0]) {
      const moduleName = packageSpecifier(node.arguments[0]);
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && moduleName === PACKAGE_NAME) {
        diagnostics.push(diagnostic(file, "unsupported dynamic import from @inobeta/ui"));
      }
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && moduleName && moduleName.startsWith(`${PACKAGE_NAME}/`)) {
        diagnostics.push(diagnostic(file, `unsupported deep dynamic import: ${moduleName}`));
      }
      if (ts.isIdentifier(node.expression) && node.expression.text === "require" && moduleName === PACKAGE_NAME) {
        diagnostics.push(diagnostic(file, "unsupported require import from @inobeta/ui"));
      }
      if (ts.isIdentifier(node.expression) && node.expression.text === "require" && moduleName && moduleName.startsWith(`${PACKAGE_NAME}/`)) {
        diagnostics.push(diagnostic(file, `unsupported deep require import: ${moduleName}`));
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return diagnostics;
}

function renderImport(node, specifiers, moduleSpecifier, sourceFile) {
  const clause = node.importClause;
  const namedBindings = ts.factory.createNamedImports(specifiers);
  const importClause = ts.factory.createImportClause(clause.isTypeOnly, undefined, namedBindings);
  const replacement = ts.factory.createImportDeclaration(
    node.modifiers,
    importClause,
    ts.factory.createStringLiteral(moduleSpecifier),
    node.attributes
  );
  return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printNode(
    ts.EmitHint.Unspecified,
    replacement,
    sourceFile
  );
}

function planFile(file, content, symbols, destination) {
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const diagnostics = packageUseDiagnostics(sourceFile, file);
  const edits = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || packageSpecifier(statement.moduleSpecifier) !== PACKAGE_NAME) {
      continue;
    }
    const clause = statement.importClause;
    if (!clause || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      continue;
    }

    const moved = [];
    const retained = [];
    for (const specifier of clause.namedBindings.elements) {
      (symbols.has(specifier.propertyName ? specifier.propertyName.text : specifier.name.text) ? moved : retained).push(specifier);
    }
    if (!moved.length) {
      continue;
    }
    if (!isConsumerFile(file)) {
      diagnostics.push(diagnostic(file, `unsupported cross-project import from ${PACKAGE_NAME}`));
      continue;
    }

    const localPath = relativeImportPath(file, destination);
    const replacements = [];
    if (retained.length) {
      replacements.push(renderImport(statement, retained, PACKAGE_NAME, sourceFile));
    }
    replacements.push(renderImport(statement, moved, localPath, sourceFile));
    edits.push({ start: statement.getStart(sourceFile), end: statement.end, text: replacements.join("\n") });
  }

  if (diagnostics.length) {
    return { diagnostics };
  }
  if (!edits.length) {
    return undefined;
  }
  let next = content;
  for (const edit of edits.reverse()) {
    next = `${next.slice(0, edit.start)}${edit.text}${next.slice(edit.end)}`;
  }
  return { file, content: next };
}

function preflightFamily(tree, config) {
  if (!config || !config.name || !config.destination || !config.symbols) {
    throw new MigrationError("Invalid migration family configuration");
  }
  const symbols = new Set(config.symbols);
  const diagnostics = [];
  const rewrites = [];
  for (const file of treeFiles(tree)) {
    if (!/\.[cm]?tsx?$/i.test(file)) {
      continue;
    }
    const content = tree.readText(file);
    const result = planFile(file, content, symbols, config.destination);
    if (!result) {
      continue;
    }
    if (result.diagnostics) {
      diagnostics.push(...result.diagnostics);
    } else {
      rewrites.push(result);
    }
  }

  if (diagnostics.length) {
    throw new MigrationError(`Preflight failed for ${config.name}`, diagnostics);
  }
  if (!rewrites.length) {
    return { rewrites, copies: [], overwrites: [], required: false };
  }

  const copies = [];
  for (const entry of payloadEntries(config.payload)) {
    const existing = tree.read(entry.path);
    if (existing && !sameContent(existing, entry.content)) {
      diagnostics.push(diagnostic(entry.path, "destination collision has different content"));
    } else if (!existing) {
      copies.push(entry);
    }
  }
  if (diagnostics.length) {
    throw new MigrationError(`Preflight failed for ${config.name}`, diagnostics);
  }
  const overwrites = config.prepare ? config.prepare(tree) : [];
  if (!Array.isArray(overwrites)) {
    throw new MigrationError(`Preflight failed for ${config.name}`, [
      diagnostic(config.name, "migration preparation must return an array"),
    ]);
  }
  return { rewrites, copies, overwrites, required: true };
}

async function migrateFamily(tree, config, prompts = createNonInteractivePromptAdapter()) {
  const plan = preflightFamily(tree, config);
  if (!plan.required) {
    return { status: "noop", plan };
  }
  if (!prompts.isInteractive) {
    throw new MigrationError(`Interactive confirmation required for ${config.name}`);
  }
  const accepted = await prompts.confirm(config.prompt || `Migrate ${config.name}?`);
  if (!accepted) {
    return { status: "declined", plan };
  }
  if (typeof tree.branch !== "function" || typeof tree.merge !== "function") {
    throw new MigrationError("Tree does not support atomic branch commits");
  }
  const staged = tree.branch();
  for (const copy of plan.copies) {
    staged.create(copy.path, copy.content);
  }
  for (const rewrite of plan.rewrites) {
    staged.overwrite(rewrite.file, rewrite.content);
  }
  for (const overwrite of plan.overwrites) {
    staged.overwrite(overwrite.path, overwrite.content);
  }
  tree.merge(staged);
  return { status: "migrated", plan };
}

module.exports = {
  MigrationError,
  migrateFamily,
  preflightFamily,
  relativeImportPath,
};
