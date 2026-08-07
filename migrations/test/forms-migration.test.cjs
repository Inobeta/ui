"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { HostTree } = require("@angular-devkit/schematics");
const { MigrationError } = require("../update-22/lib/engine");
const { createTestPromptAdapter } = require("../update-22/lib/prompt");
const {
  FORMS_SYMBOLS,
  MATERIAL_FORMS_SYMBOLS,
  createFormsFamily,
  loadPayload,
  migrateFormsFamily,
} = require("../update-22/forms");

const FIXTURES = path.join(__dirname, "fixtures", "forms");
const fixture = (name) => fs.readFileSync(path.join(FIXTURES, name), "utf8");
const treeWith = (name) => { const tree = new HostTree(); tree.create("/src/app/app.component.ts", fixture(name)); return tree; };
const snapshot = (tree) => {
  const files = [];
  const visit = (entry) => {
    for (const file of entry.subfiles || []) files.push(path.posix.join(entry.path, file));
    for (const dir of entry.subdirs || []) visit(tree.getDir(path.posix.join(entry.path, dir)));
  };
  visit(tree.root);
  return files.sort().map((file) => [file, tree.readText(file)]);
};

describe("Forms manifests and payload", () => {
  it("contains complete public-barrel manifests", () => {
    for (const symbol of ["IbFormArray", "IbFormControlBase", "IbDynamicFormComponent", "IbDynamicFormsModule"]) assert.ok(FORMS_SYMBOLS.includes(symbol));
    for (const symbol of ["IbMatAutocompleteControl", "IbMatButtonData", "IbMaterialFormModule", "IbMaterialFormStubComponent"]) assert.ok(MATERIAL_FORMS_SYMBOLS.includes(symbol));
    assert.equal(new Set(FORMS_SYMBOLS).size, FORMS_SYMBOLS.length);
    assert.equal(new Set(MATERIAL_FORMS_SYMBOLS).size, MATERIAL_FORMS_SYMBOLS.length);
  });

  it("vendors both trees, public stubs, and no private docs/specs", () => {
    const payload = loadPayload();
    assert.ok(payload["/src/app/core/forms/index.ts"]);
    assert.ok(payload["/src/app/core/material-forms/index.ts"]);
    assert.ok(payload["/src/app/core/material-forms/material-form/material-form.stub.spec.ts"]);
    assert.equal(Object.keys(payload).some((file) => /\.stories\.|\.mdx$|(?<!\.stub)(?<!-stub)\.spec\.ts$/.test(file)), false);
    assert.equal(Object.values(payload).some((content) => content.includes("@deprecated")), false);
    assert.ok(payload["/src/app/core/material-forms/material-form.module.ts"].includes('from "@inobeta/ui"'));
  });
});

describe("Forms migration", () => {
  it("noops without prompting when consumer-owned Forms destinations differ", async () => {
    const tree = treeWith("no-use.ts");
    tree.create("/src/app/core/forms/index.ts", "consumer-owned forms\n");
    tree.create("/src/app/core/material-forms/index.ts", "consumer-owned material forms\n");
    const before = snapshot(tree);
    const result = await migrateFormsFamily(tree, createFormsFamily(), {
      isInteractive: true,
      confirm: async () => assert.fail("unused family must not prompt"),
    });
    assert.equal(result.status, "noop");
    assert.deepEqual(snapshot(tree), before);
  });

  it("uses one family prompt and routes mixed imports to sibling barrels", async () => {
    const tree = treeWith("combined.ts");
    const result = await migrateFormsFamily(tree, createFormsFamily(), createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    const content = tree.readText("/src/app/app.component.ts");
    assert.match(content, /from \"\.\/core\/forms\"/);
    assert.match(content, /from \"\.\/core\/material-forms\"/);
    assert.match(content, /from \"@inobeta\/ui\"/);
  });

  it("supports base-only, material-only, aliases, and type imports", async () => {
    for (const name of ["base-only.ts", "material-only.ts"]) {
      const tree = treeWith(name);
      assert.equal((await migrateFormsFamily(tree, createFormsFamily(), createTestPromptAdapter(true))).status, "migrated");
      assert.doesNotMatch(tree.readText("/src/app/app.component.ts"), /from "@inobeta\/ui"/);
    }
  });

  it("declines and rejects unsupported syntax transactionally", async () => {
    const declined = treeWith("declined.ts");
    const before = declined.readText("/src/app/app.component.ts");
    assert.equal((await migrateFormsFamily(declined, createFormsFamily(), createTestPromptAdapter(false))).status, "declined");
    assert.equal(declined.readText("/src/app/app.component.ts"), before);
    const unsupported = treeWith("unsupported.ts");
    await assert.rejects(() => migrateFormsFamily(unsupported, createFormsFamily(), createTestPromptAdapter(true)), MigrationError);
    assert.equal(unsupported.readText("/src/app/app.component.ts"), fixture("unsupported.ts"));
  });

  it("rejects differing collisions and is idempotent", async () => {
    const tree = treeWith("combined.ts");
    tree.create("/src/app/core/forms/index.ts", "different");
    await assert.rejects(() => migrateFormsFamily(tree, createFormsFamily(), createTestPromptAdapter(true)), MigrationError);
    const clean = treeWith("combined.ts");
    await migrateFormsFamily(clean, createFormsFamily(), createTestPromptAdapter(true));
    const first = JSON.stringify([clean.readText("/src/app/app.component.ts"), clean.readText("/src/app/core/forms/index.ts")]);
    assert.equal((await migrateFormsFamily(clean, createFormsFamily(), createTestPromptAdapter(true))).status, "noop");
    assert.equal(JSON.stringify([clean.readText("/src/app/app.component.ts"), clean.readText("/src/app/core/forms/index.ts")]), first);
  });
});
