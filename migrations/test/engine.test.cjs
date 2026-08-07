"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { HostTree } = require("@angular-devkit/schematics");
const { MigrationError, migrateFamily, relativeImportPath } = require("../update-22/lib/engine");
const { createNonInteractivePromptAdapter, createTestPromptAdapter, createTtyPromptAdapter } = require("../update-22/lib/prompt");

const FIXTURES = path.join(__dirname, "fixtures", "engine");
const config = (payload = { "/src/app/core/http/index.ts": "export const payload = true;\n" }) => ({
  name: "HTTP",
  symbols: ["IbHttpModule", "IbHttpOptions"],
  destination: "/src/app/core/http/index.ts",
  payload,
});

function fixture(name) {
  return fs.readFileSync(path.join(FIXTURES, name), "utf8");
}

function treeWith(file, content, pathName = "/src/app/app.component.ts") {
  const tree = new HostTree();
  tree.create(pathName, content === undefined ? fixture(file) : content);
  return tree;
}

function snapshot(tree) {
  const files = [];
  const visit = (entry) => {
    for (const file of entry.subfiles || []) files.push(path.posix.join(entry.path, file));
    for (const dir of entry.subdirs || []) visit(tree.getDir(path.posix.join(entry.path, dir)));
  };
  visit(tree.root);
  return files.sort().map((file) => [file, tree.readText(file)]);
}

async function expectPreflightFailure(tree, family) {
  const before = snapshot(tree);
  await assert.rejects(() => migrateFamily(tree, family, createTestPromptAdapter(true)), MigrationError);
  assert.deepEqual(snapshot(tree), before);
}

describe("v22 transactional migration engine", () => {
  it("splits mixed imports, preserving aliases and retained package symbols", async () => {
    const tree = treeWith("mixed.ts");
    const result = await migrateFamily(tree, config(), createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    assert.equal(tree.readText("/src/app/app.component.ts"), [
      'import { IbToastService } from "@inobeta/ui";',
      'import { IbHttpModule as LocalHttp, type IbHttpOptions } from "./core/http";',
      "",
      "export { LocalHttp, IbToastService, IbHttpOptions };",
      "",
    ].join("\n"));
    assert.equal(tree.readText("/src/app/core/http/index.ts"), "export const payload = true;\n");
  });

  it("preserves import type imports", async () => {
    const tree = treeWith("type-only.ts");
    await migrateFamily(tree, config(), createTestPromptAdapter(true));
    assert.match(tree.readText("/src/app/app.component.ts"), /import type \{ IbHttpOptions as Options \} from "\.\/core\/http";/);
    assert.match(tree.readText("/src/app/app.component.ts"), /import type \{ IbToastConfig \} from "@inobeta\/ui";/);
  });

  it("generates extensionless POSIX local paths", () => {
    assert.equal(relativeImportPath("/src/app/pages/a.ts", "/src/app/core/http/index.ts"), "../core/http");
  });

  it("exposes injectable TTY and deterministic test prompt adapters", async () => {
    const tty = createTtyPromptAdapter({ input: { isTTY: true }, output: { isTTY: true } });
    assert.equal(tty.isInteractive, true);
    assert.equal(await createTestPromptAdapter(true).confirm("ignored"), true);
    assert.equal(await createTestPromptAdapter(false).confirm("ignored"), false);
  });

  it("is a no-op when no configured symbol is used", async () => {
    const tree = treeWith("no-use.ts");
    tree.create("/src/app/core/http/index.ts", "consumer-owned content\n");
    const before = snapshot(tree);
    const result = await migrateFamily(tree, config(), {
      isInteractive: true,
      confirm: async () => assert.fail("unused family must not prompt"),
    });
    assert.equal(result.status, "noop");
    assert.deepEqual(snapshot(tree), before);
  });

  it("fails without edits in non-interactive mode", async () => {
    const tree = treeWith("mixed.ts");
    const before = snapshot(tree);
    await assert.rejects(() => migrateFamily(tree, config(), createNonInteractivePromptAdapter()), /Interactive confirmation required/);
    assert.deepEqual(snapshot(tree), before);
  });

  it("accepts identical payloads and rejects differing collisions", async () => {
    const identical = treeWith("mixed.ts");
    identical.create("/src/app/core/http/index.ts", "export const payload = true;\n");
    await migrateFamily(identical, config(), createTestPromptAdapter(true));
    const collision = treeWith("mixed.ts");
    collision.create("/src/app/core/http/index.ts", "different\n");
    await expectPreflightFailure(collision, config());
  });

  for (const [name, message, target] of [
    ["unsupported-namespace.ts", "namespace", "/src/app/app.component.ts"],
    ["unsupported-default.ts", "default", "/src/app/app.component.ts"],
    ["unsupported-dynamic.ts", "dynamic", "/src/app/app.component.ts"],
    ["unsupported-deep.ts", "deep", "/src/app/app.component.ts"],
    ["cross-project.ts", "cross-project", "/projects/demo/src/app.component.ts"],
  ]) {
    it(`rejects ${message} syntax with file diagnostics before writes`, async () => {
      const tree = treeWith(name, undefined, target);
      const before = snapshot(tree);
      await assert.rejects(
        () => migrateFamily(tree, config(), createTestPromptAdapter(true)),
        (error) => error instanceof MigrationError && error.diagnostics.some((item) => item.file === target && item.message.includes(message))
      );
      assert.deepEqual(snapshot(tree), before);
    });
  }

  it("does not commit a declined family and second accepted run is a no-op", async () => {
    const tree = treeWith("mixed.ts");
    const before = snapshot(tree);
    const declined = await migrateFamily(tree, config(), createTestPromptAdapter(false));
    assert.equal(declined.status, "declined");
    assert.deepEqual(snapshot(tree), before);
    await migrateFamily(tree, config(), createTestPromptAdapter(true));
    const migrated = snapshot(tree);
    const second = await migrateFamily(tree, config(), createTestPromptAdapter(true));
    assert.equal(second.status, "noop");
    assert.deepEqual(snapshot(tree), migrated);
  });
});
