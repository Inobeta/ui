"use strict";
/**
 * @license MIT
 * @fileoverview Verify that the v22 migration collection is loadable
 * and that its factory returns a valid schematic Rule.
 */

const { describe, it, before } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const PACKAGE_ROOT = path.resolve(__dirname, "..", "..", "dist");

describe("@inobeta/ui v22 migration collection", () => {
  let pkg;

  before(() => {
    pkg = require(path.join(PACKAGE_ROOT, "package.json"));
  });

  it("package.json declares ng-update.migrations", () => {
    assert.ok(pkg["ng-update"], "missing ng-update metadata");
    assert.ok(
      pkg["ng-update"].migrations,
      "missing ng-update.migrations pointer"
    );
  });

  it("migrations file exists at the declared path", () => {
    const migrationsRel = pkg["ng-update"].migrations;
    const migrationsAbs = path.resolve(PACKAGE_ROOT, migrationsRel);

    // require() will throw if the file does not exist
    const collection = require(migrationsAbs);
    assert.ok(collection, "collection module did not export anything");
  });

  it("collection contains a 22.0.0 schematic entry", () => {
    const migrationsRel = pkg["ng-update"].migrations;
    const migrationsAbs = path.resolve(PACKAGE_ROOT, migrationsRel);
    const collection = require(migrationsAbs);

    assert.ok(
      collection.schematics,
      "collection is missing schematics map"
    );
    assert.ok(
      collection.schematics["22.0.0"],
      "collection is missing 22.0.0 schematic entry"
    );
    assert.strictEqual(
      collection.schematics["22.0.0"].version,
      "22.0.0"
    );
  });

  it("22.0.0 factory can be loaded from the collection", () => {
    const migrationsRel = pkg["ng-update"].migrations;
    const migrationsAbs = path.resolve(PACKAGE_ROOT, migrationsRel);
    const collection = require(migrationsAbs);

    const factoryRel = collection.schematics["22.0.0"].factory;
    const factoryAbs = path.resolve(path.dirname(migrationsAbs), factoryRel);

    const factory = require(factoryAbs);
    assert.strictEqual(
      typeof factory,
      "object",
      `factory module is not an object, got ${typeof factory}`
    );
    assert.strictEqual(
      typeof factory.default,
      "function",
      `factory.default is not a function, got ${typeof factory.default}`
    );

    const rule = factory.default({});
    assert.strictEqual(
      typeof rule,
      "function",
      `factory did not return a Rule (function), got ${typeof rule}`
    );
  });
});
