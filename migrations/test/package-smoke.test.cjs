"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { HostTree } = require("@angular-devkit/schematics");

const REPOSITORY_ROOT = path.resolve(__dirname, "..", "..");
const PACKAGE_ROOT = path.join(REPOSITORY_ROOT, "dist");
const FIXTURE = path.join(__dirname, "fixtures", "package-consumer", "mixed-import.ts");
const FORMS_FIXTURE = path.join(__dirname, "fixtures", "package-consumer", "forms-import.ts");

const CONSUMER_DEPENDENCIES = {
  "@angular/animations": "^22.1.0",
  "@angular/cdk": "^22.1.1",
  "@angular/common": "^22.1.0",
  "@angular/compiler": "^22.1.0",
  "@angular/compiler-cli": "^22.1.0",
  "@angular/core": "^22.1.0",
  "@angular/forms": "^22.1.0",
  "@angular/material": "^22.1.1",
  "@ngrx/effects": "^22.0.0-rc.0",
  "@ngrx/store": "^22.0.0-rc.0",
  "@ngx-translate/core": "^16.x.x",
  "@inobeta/ui": "file:node_modules/@inobeta/ui",
  "rxjs": "^7.x.x",
  "tslib": "^2.4.0",
  "typescript": "~6.0.3",
  "zone.js": "~0.16.0",
};

function loadPublishedFactory() {
  const pkg = require(path.join(PACKAGE_ROOT, "package.json"));
  const collectionPath = path.resolve(PACKAGE_ROOT, pkg["ng-update"].migrations);
  const collection = require(collectionPath);
  const factoryPath = require.resolve(path.resolve(path.dirname(collectionPath), collection.schematics["22.0.0"].factory));
  return { collectionPath, factoryPath, factory: require(factoryPath).default };
}

function createTree() {
  const tree = new HostTree();
  tree.create("/package.json", "{\n  \"dependencies\": {}\n}\n");
  tree.create("/src/app/app.component.ts", fs.readFileSync(FIXTURE, "utf8"));
  return tree;
}

function createFormsCompileTree() {
  const tree = new HostTree();
  tree.create("/package.json", "{\n  \"dependencies\": {}\n}\n");
  tree.create("/src/app/app.component.ts", fs.readFileSync(FORMS_FIXTURE, "utf8"));
  return tree;
}

function createPrompt(answers, calls) {
  return {
    isInteractive: true,
    async confirm(message) {
      calls.push(message);
      return answers.shift();
    },
  };
}

function createContext() {
  return { logger: { info() {}, warn() {}, error() {} } };
}

function packedFiles() {
  const result = childProcess.spawnSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return new Set(JSON.parse(result.stdout)[0].files.map((file) => file.path));
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

function writeTree(tree, destination) {
  for (const file of treeFiles(tree)) {
    const target = path.join(destination, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, tree.readText(file));
  }
}

function linkDependency(workspace, name) {
  const source = path.join(REPOSITORY_ROOT, "node_modules", name);
  const target = path.join(workspace, "node_modules", name);
  assert.ok(fs.existsSync(source), `missing declared consumer dependency: ${name}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(source, target, "dir");
}

function prepareFormsCompileWorkspace(tree) {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "inobeta-forms-compile-"));
  writeTree(tree, workspace);
  fs.writeFileSync(path.join(workspace, "package.json"), `${JSON.stringify({
    private: true,
    dependencies: CONSUMER_DEPENDENCIES,
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(workspace, "tsconfig.json"), `${JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "es2022",
      moduleResolution: "bundler",
      experimentalDecorators: true,
      strict: false,
      skipLibCheck: true,
      noEmitOnError: true,
      outDir: "./out-tsc",
      rootDir: ".",
    },
    files: ["src/app/app.component.ts"],
    angularCompilerOptions: {
      enableResourceInlining: true,
      strictTemplates: false,
    },
  }, null, 2)}\n`);
  fs.mkdirSync(path.join(workspace, "node_modules", "@inobeta"), { recursive: true });
  fs.cpSync(PACKAGE_ROOT, path.join(workspace, "node_modules", "@inobeta", "ui"), { recursive: true });
  for (const dependency of ["@angular", "@ngrx", "@ngx-translate", "rxjs", "tslib", "typescript", "zone.js"]) {
    linkDependency(workspace, dependency);
  }
  return workspace;
}

describe("published v22 migration", () => {
  it("loads collection, bridge, engine, manifests, and payload from dist only", () => {
    const { collectionPath, factoryPath, factory } = loadPublishedFactory();
    const required = [
      collectionPath,
      factoryPath,
      path.join(PACKAGE_ROOT, "migrations", "update-22", "lib", "engine.js"),
      path.join(PACKAGE_ROOT, "migrations", "update-22", "http", "index.js"),
      path.join(PACKAGE_ROOT, "migrations", "update-22", "forms", "index.js"),
      path.join(PACKAGE_ROOT, "migrations", "update-22", "files", "http", "index.ts"),
      path.join(PACKAGE_ROOT, "migrations", "update-22", "files", "forms", "index.ts"),
      path.join(PACKAGE_ROOT, "migrations", "update-22", "files", "material-forms", "index.ts"),
    ];
    for (const file of required) assert.ok(fs.existsSync(file), `missing published asset: ${file}`);
    assert.equal(typeof factory, "function");
    for (const file of required) {
      if (file.endsWith(".js")) assert.doesNotMatch(fs.readFileSync(file, "utf8"), /src\/app\/inobeta-ui\//);
    }
  });

  it("migrates mixed HTTP and Forms imports with deterministic prompts", async () => {
    const { factory } = loadPublishedFactory();
    const calls = [];
    const tree = createTree();
    await factory({ promptAdapter: createPrompt([true, true], calls) })(tree, createContext());

    assert.deepEqual(calls.map((message) => message.split(".")[0]), [
      "The HTTP module is being removed from @inobeta/ui",
      "Forms and Material Forms are being removed from @inobeta/ui",
    ]);
    const content = tree.readText("/src/app/app.component.ts");
    assert.match(content, /from "\.\/core\/http"/);
    assert.match(content, /from "\.\/core\/forms"/);
    assert.match(content, /from "\.\/core\/material-forms"/);
    assert.match(content, /IbToastService[\s\S]*from "@inobeta\/ui"/);
    assert.ok(tree.exists("/src/app/core/http/index.ts"));
    assert.ok(tree.exists("/src/app/core/forms/index.ts"));
    assert.ok(tree.exists("/src/app/core/material-forms/index.ts"));
    assert.equal(JSON.parse(tree.readText("/package.json")).dependencies["jwt-decode"], "^4.0.0");
  });

  it("keeps declined Forms atomic after accepted HTTP", async () => {
    const { factory } = loadPublishedFactory();
    const tree = createTree();
    await factory({ promptAdapter: createPrompt([true, false], []) })(tree, createContext());

    const content = tree.readText("/src/app/app.component.ts");
    assert.match(content, /from "\.\/core\/http"/);
    assert.match(content, /IbDynamicFormsModule[\s\S]*from "@inobeta\/ui"/);
    assert.ok(tree.exists("/src/app/core/http/index.ts"));
    assert.ok(!tree.exists("/src/app/core/forms/index.ts"));
    assert.ok(!tree.exists("/src/app/core/material-forms/index.ts"));
  });

  it("Angular-compiles vendored Forms from the packed package only", async () => {
    const { factory } = loadPublishedFactory();
    const tree = createFormsCompileTree();
    await factory({ promptAdapter: createPrompt([true], []) })(tree, createContext());

    const source = tree.readText("/src/app/app.component.ts");
    assert.doesNotMatch(source, /from "@inobeta\/ui"/);
    assert.ok(tree.exists("/src/app/core/forms/index.ts"));
    assert.ok(tree.exists("/src/app/core/material-forms/index.ts"));

    const workspace = prepareFormsCompileWorkspace(tree);
    try {
      const result = childProcess.spawnSync(
        process.execPath,
        [path.join(workspace, "node_modules", "@angular", "compiler-cli", "bundles", "src", "bin", "ngc.js"), "-p", "tsconfig.json"],
        { cwd: workspace, encoding: "utf8" },
      );
      assert.equal(result.status, 0, result.stderr || result.stdout);
    } finally {
      fs.rmSync(workspace, { recursive: true, force: true });
    }
  });

  it("includes migration collection, bridge, engine, manifests, and payloads in tarball", () => {
    const files = packedFiles();
    for (const file of [
      "migrations/migrations.json",
      "migrations/update-22/index.js",
      "migrations/update-22/lib/engine.js",
      "migrations/update-22/http/index.js",
      "migrations/update-22/forms/index.js",
      "migrations/update-22/files/http/index.ts",
      "migrations/update-22/files/forms/index.ts",
      "migrations/update-22/files/material-forms/index.ts",
    ]) assert.ok(files.has(file), `tarball missing ${file}`);
  });
});
