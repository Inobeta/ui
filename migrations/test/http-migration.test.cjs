"use strict";

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { HostTree } = require("@angular-devkit/schematics");
const { MigrationError, migrateFamily } = require("../update-22/lib/engine");
const { createTestPromptAdapter, createNonInteractivePromptAdapter } = require("../update-22/lib/prompt");
const { HTTP_SYMBOLS, loadPayload, prepareJwtDecodeDependency, createHttpFamily } = require("../update-22/http");
const migrationFactory = require("../update-22").default;

const FIXTURES = path.join(__dirname, "fixtures", "http");

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

async function expectPreflightFailure(tree, config) {
  const before = snapshot(tree);
  await assert.rejects(() => migrateFamily(tree, config, createTestPromptAdapter(true)), MigrationError);
  assert.deepEqual(snapshot(tree), before);
}

describe("HTTP migration config", () => {
  it("contains all expected public symbols", () => {
    const expected = [
      "IbSession", "IbUserLogin", "IbAuthTypes", "IbAPITokens",
      "IbAuthGuard", "IbLoginGuard", "IbRoleGuard",
      "IbLoginService",
      "IbSpinnerLoadingComponent",
      "ibCrudToast",
      "IbHttpModule",
      "IbHttpTestModule",
      "IbLoadingSkeletonRectComponent",
      "IbLoadingSkeletonContainerComponent",
      "IbLoadingDirective",
      "IbRoleCheckDirective",
      "IHttpStore", "ibHttpEffects",
      "ibSessionFeature", "ibLoaderFeature",
      "ibSelectAccessTokenExp", "ibSelectActiveSession", "ibSelectDecodedData",
      "ibSelectIsHttpLoading", "ibSelectIsHttpUrlLoading",
      "ibHttpReducers",
      "IbLoaderState", "ibRequestHttp",
      "IbSessionState",
      "ibLoaderActions", "ibAuthActions",
      "ibLoaderExtraSelectors", "IbSessionEffects",
      "ibLoaderReducerMain", "ibSessionReducerMain",
      "IbLoadingStubDirective", "SpinnerLoadingStubComponent",
    ];
    for (const sym of expected) {
      assert.ok(HTTP_SYMBOLS.includes(sym), `missing symbol: ${sym}`);
    }
    assert.equal(HTTP_SYMBOLS.length, expected.length);
  });

  it("loads payload files from disk", () => {
    const payload = loadPayload();
    assert.ok(Object.keys(payload).length > 0, "payload should have files");

    const keys = Object.keys(payload);
    assert.ok(keys.some((k) => k === "/src/app/core/http/index.ts"), "must contain barrel index");
    assert.ok(keys.some((k) => k === "/src/app/core/http/http.module.ts"), "must contain module");
    assert.ok(keys.some((k) => k === "/src/app/core/http/auth/session.model.ts"), "must contain session model");
    assert.ok(keys.some((k) => k === "/src/app/core/http/store/index.ts"), "must contain store barrel");

    const indexContent = payload["/src/app/core/http/index.ts"];
    assert.ok(indexContent.includes("export * from './auth/session.model'"), "barrel must re-export session model");

    const moduleContent = payload["/src/app/core/http/http.module.ts"];
    assert.ok(moduleContent.includes('"@inobeta/ui"'), "module should import from @inobeta/ui for retained features");
    assert.ok(!moduleContent.includes("@deprecated"), "module must not contain deprecated tags");

    const sessionContent = payload["/src/app/core/http/auth/session.model.ts"];
    assert.ok(!sessionContent.includes("@deprecated"), "session model must not contain deprecated tags");
  });

  it("creates a valid family config", () => {
    const family = createHttpFamily();
    assert.equal(family.name, "HTTP");
    assert.equal(family.destination, "/src/app/core/http/index.ts");
    assert.ok(Array.isArray(family.symbols));
    assert.ok(family.symbols.length > 0);
    assert.ok(family.payload);
    assert.equal(typeof family.payload, "object");
    assert.ok(family.prompt);
  });
});

describe("HTTP migration engine integration", () => {
  let config;

  before(() => {
    config = createHttpFamily();
  });

  it("noop when no HTTP symbol is used", async () => {
    const tree = treeWith("http-no-use.ts");
    tree.create("/src/app/core/http/index.ts", "consumer-owned content\n");
    tree.create("/package.json", "{\n  \"dependencies\": {}\n}\n");
    const before = snapshot(tree);
    const result = await migrateFamily(tree, config, {
      isInteractive: true,
      confirm: async () => assert.fail("unused family must not prompt"),
    });
    assert.equal(result.status, "noop");
    assert.deepEqual(snapshot(tree), before);
  });

  it("migrates mixed imports, preserving retained package symbols", async () => {
    const tree = treeWith("http-mixed.ts");
    const result = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    const content = tree.readText("/src/app/app.component.ts");
    assert.ok(content.includes('import { IbToastService } from "@inobeta/ui";'), "retained symbols stay in package import");
    assert.ok(content.includes('import { IbHttpModule, IbLoginService } from "./core/http"'), "HTTP symbols move to local barrel");
    assert.ok(tree.readText("/src/app/core/http/index.ts"), "barrel file was created");
  });

  it("migrates HTTP-only imports with inline type specifier", async () => {
    const tree = treeWith("http-only.ts");
    const result = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    const content = tree.readText("/src/app/app.component.ts");
    assert.ok(!content.includes('"@inobeta/ui"'), "no remaining @inobeta/ui import for this file");
    assert.ok(content.includes('import { IbHttpModule, type IbAuthTypes, IbAuthGuard } from "./core/http"'), "all symbols moved");
  });

  it("preserves import aliases", async () => {
    const tree = treeWith("http-aliases.ts");
    const result = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    const content = tree.readText("/src/app/app.component.ts");
    assert.ok(content.includes('import { IbHttpModule as HttpModule, IbLoginService as LoginSvc } from "./core/http"'), "aliases preserved");
    assert.ok(content.includes('import { IbToastService } from "@inobeta/ui"'), "retained symbol in separate import");
    assert.ok(content.includes("export { HttpModule, LoginSvc, IbToastService };"), "export uses alias names");
  });

  it("preserves import type imports", async () => {
    const tree = treeWith("http-type-only.ts");
    const result = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    const content = tree.readText("/src/app/app.component.ts");
    assert.ok(content.includes('import type { IbAuthTypes, IbSessionState } from "./core/http"'), "type-only HTTP symbols moved");
    assert.ok(content.includes('import type { IbToastConfig } from "@inobeta/ui"'), "type-only retained symbols stay");
  });

  it("declines without changes", async () => {
    const tree = treeWith("http-mixed.ts");
    tree.create("/package.json", "{\n  \"dependencies\": {}\n}\n");
    const before = snapshot(tree);
    const result = await migrateFamily(tree, config, createTestPromptAdapter(false));
    assert.equal(result.status, "declined");
    assert.deepEqual(snapshot(tree), before, "tree unchanged after decline");
    assert.ok(!tree.exists("/src/app/core/http/index.ts"), "no barrel created");
  });

  it("fails without edits in non-interactive mode when files need migration", async () => {
    const tree = treeWith("http-mixed.ts");
    const before = snapshot(tree);
    await assert.rejects(
      () => migrateFamily(tree, config, createNonInteractivePromptAdapter()),
      /Interactive confirmation required/
    );
    assert.deepEqual(snapshot(tree), before);
    assert.ok(!tree.exists("/src/app/core/http/index.ts"), "no barrel created");
  });

  it("rolls back HTTP files, imports, and package metadata when dependency preparation fails", async () => {
    const tree = treeWith("http-mixed.ts");
    tree.create("/package.json", fixture("package-malformed.json"));
    const before = snapshot(tree);

    await assert.rejects(
      () => migrationFactory({ promptAdapter: createTestPromptAdapter(true) })(tree, { logger: { info() {}, warn() {}, error() {} } }),
      (error) => error instanceof MigrationError && error.diagnostics.some(
        (item) => item.file === "/package.json" && item.message.includes("invalid package.json")
      )
    );

    assert.deepEqual(snapshot(tree), before, "dependency preparation failure must leave tree byte-identical");
  });

  it("payload includes all required runtime source files", () => {
    const payload = loadPayload();
    const requiredFiles = [
      "/src/app/core/http/index.ts",
      "/src/app/core/http/http.module.ts",
      "/src/app/core/http/http-test.module.ts",
      "/src/app/core/http/translations.ts",
      "/src/app/core/http/auth/session.model.ts",
      "/src/app/core/http/auth/guard.service.ts",
      "/src/app/core/http/auth/login.service.ts",
      "/src/app/core/http/auth/login.service.stub.spec.ts",
      "/src/app/core/http/http/auth.interceptor.ts",
      "/src/app/core/http/http/error.interceptor.ts",
      "/src/app/core/http/http/loader.interceptor.ts",
      "/src/app/core/http/http/messages.decorator.ts",
      "/src/app/core/http/http/spinner-loading.component.ts",
      "/src/app/core/http/http/spinner-loading.stub.spec.ts",
      "/src/app/core/http/http/loading-skeleton.component.ts",
      "/src/app/core/http/http/loading-skeleton-container.component.ts",
      "/src/app/core/http/http/loading-skeleton.directive.ts",
      "/src/app/core/http/http/loading-skeleton.directive.stub.spec.ts",
      "/src/app/core/http/http/role-check.directive.ts",
      "/src/app/core/http/http/response-handler.service.ts",
      "/src/app/core/http/store/index.ts",
      "/src/app/core/http/store/loader/actions.ts",
      "/src/app/core/http/store/loader/interfaces.ts",
      "/src/app/core/http/store/loader/reducers.ts",
      "/src/app/core/http/store/loader/selectors.ts",
      "/src/app/core/http/store/session/actions.ts",
      "/src/app/core/http/store/session/effects.ts",
      "/src/app/core/http/store/session/interfaces.ts",
      "/src/app/core/http/store/session/reducers.ts",
      "/src/app/core/http/store/session/selectors.ts",
    ];
    for (const f of requiredFiles) {
      assert.ok(payload[f], `missing required file: ${f}`);
    }
  });
});

describe("HTTP migration collision and idempotency", () => {
  let config;

  before(() => {
    config = createHttpFamily();
  });

  it("accepts identical destination file", async () => {
    const tree = treeWith("http-mixed.ts");
    const barrelContent = loadPayload()["/src/app/core/http/index.ts"];
    tree.create("/src/app/core/http/index.ts", barrelContent);
    const result = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(result.status, "migrated", "should accept identical file");
  });

  it("rejects differing destination file", async () => {
    const tree = treeWith("http-mixed.ts");
    tree.create("/src/app/core/http/index.ts", "// different content\n");
    const before = snapshot(tree);
    await assert.rejects(
      () => migrateFamily(tree, config, createTestPromptAdapter(true)),
      (error) => error instanceof MigrationError && error.diagnostics.some(
        (d) => d.file === "/src/app/core/http/index.ts" && d.message.includes("collision")
      )
    );
    assert.deepEqual(snapshot(tree), before);
  });

  it("second run is idempotent", async () => {
    const tree = treeWith("http-mixed.ts");
    const first = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(first.status, "migrated");
    const migrated = snapshot(tree);
    const second = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(second.status, "noop");
    assert.deepEqual(snapshot(tree), migrated, "second run produces identical tree");
  });

  it("decline then accept works", async () => {
    const tree = treeWith("http-mixed.ts");
    const declined = await migrateFamily(tree, config, createTestPromptAdapter(false));
    assert.equal(declined.status, "declined");
    const result = await migrateFamily(tree, config, createTestPromptAdapter(true));
    assert.equal(result.status, "migrated");
    assert.ok(tree.readText("/src/app/core/http/index.ts"));
  });
});

describe("HTTP migration payload quality", () => {
  it("all vendored files are free of library-relative cross-feature paths", () => {
    const payload = loadPayload();
    for (const [filePath, content] of Object.entries(payload)) {
      const hasRelativeCrossFeature = content.includes("../../ui/") || 
        content.includes("../ui/") || 
        content.includes("../storage/");
      if (hasRelativeCrossFeature) {
        // Check if the import is already rewritten to @inobeta/ui
        const lines = content.split("\n");
        for (const line of lines) {
          if ((line.includes("../../ui/") || line.includes("../ui/") || line.includes("../storage/")) && line.includes("import")) {
            assert.fail(`${filePath}: unrewritten cross-feature import: ${line.trim()}`);
          }
        }
      }
    }
  });

  it("all vendored files are free of deprecated tags", () => {
    const payload = loadPayload();
    for (const [filePath, content] of Object.entries(payload)) {
      if (content.includes("@deprecated")) {
        assert.fail(`${filePath}: contains @deprecated tag`);
      }
    }
  });

  it("cross-feature imports are rewritten to @inobeta/ui", () => {
    const payload = loadPayload();
    const moduleContent = payload["/src/app/core/http/http.module.ts"];
    assert.ok(moduleContent.includes('import { IbToastModule } from "@inobeta/ui"'), "IbToastModule from @inobeta/ui");
    assert.ok(moduleContent.includes('import { IbStorageModule } from "@inobeta/ui"'), "IbStorageModule from @inobeta/ui");
    assert.ok(moduleContent.includes('import { IbStorageTypes } from "@inobeta/ui"'), "IbStorageTypes from @inobeta/ui");

    const decoratorContent = payload["/src/app/core/http/http/messages.decorator.ts"];
    assert.ok(decoratorContent.includes('import { IbToastNotification } from \'@inobeta/ui\''), "IbToastNotification from @inobeta/ui");

    const authInterceptorContent = payload["/src/app/core/http/http/auth.interceptor.ts"];
    assert.ok(authInterceptorContent.includes('import { IbToastNotification } from "@inobeta/ui"'), "Auth interceptor uses @inobeta/ui");

    const errorInterceptorContent = payload["/src/app/core/http/http/error.interceptor.ts"];
    assert.ok(errorInterceptorContent.includes('import { IbToastNotification } from "@inobeta/ui"'), "Error interceptor uses @inobeta/ui");

    const effectsContent = payload["/src/app/core/http/store/session/effects.ts"];
    assert.ok(effectsContent.includes('import { IbStorageTypes } from "@inobeta/ui"'), "Session effects use @inobeta/ui");
  });
});

describe("jwt-decode dependency handling", () => {
  it("prepares jwt-decode insertion when package.json exists and lacks it", () => {
    const tree = new HostTree();
    tree.create("/package.json", JSON.stringify({ dependencies: {} }, null, 2) + "\n");
    const [overwrite] = prepareJwtDecodeDependency(tree);
    assert.equal(tree.readText("/package.json"), JSON.stringify({ dependencies: {} }, null, 2) + "\n");
    const pkg = JSON.parse(overwrite.content);
    assert.equal(pkg.dependencies["jwt-decode"], "^4.0.0");
  });

  it("does not prepare an overwrite for existing jwt-decode", () => {
    const tree = new HostTree();
    tree.create("/package.json", JSON.stringify({ dependencies: { "jwt-decode": "^3.0.0" } }, null, 2) + "\n");
    const overwrites = prepareJwtDecodeDependency(tree);
    const pkg = JSON.parse(tree.readText("/package.json"));
    assert.deepEqual(overwrites, []);
    assert.equal(pkg.dependencies["jwt-decode"], "^3.0.0", "existing version preserved");
  });

  it("does nothing when package.json is absent", () => {
    const tree = new HostTree();
    assert.deepEqual(prepareJwtDecodeDependency(tree), []);
    assert.ok(!tree.exists("/package.json"));
  });
});
