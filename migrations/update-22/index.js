"use strict";
/**
 * @license MIT
 * @fileoverview v22 migration schematic bridge.
 *
 * Runs interactive HTTP and Forms vendoring migrations.
 */
Object.defineProperty(exports, "__esModule", { value: true });

const { MigrationError, migrateFamily, preflightFamily } = require("./lib/engine");
const { createTtyPromptAdapter } = require("./lib/prompt");
const { createHttpFamily } = require("./http");
const { createFormsFamily, migrateFormsFamily } = require("./forms");

function reportResult(context, family, result) {
  if (result.status === "migrated") {
    context.logger.info(`${family} module vendored locally.`);
    context.logger.info("Please review and commit the imported source.");
  } else if (result.status === "declined") {
    context.logger.warn(`${family} migration declined.`);
    context.logger.warn(`You must manually remove ${family} imports from @inobeta/ui before upgrading.`);
  }
}

function reportFailure(context, family, error) {
  context.logger.error(`${family} migration blocked: ${error.message}`);
  for (const diagnostic of error.diagnostics || []) {
    context.logger.error(`  ${diagnostic.file}: ${diagnostic.message}`);
  }
}

function default_1(options = {}) {
  return async (tree, context) => {
    const prompts = options.promptAdapter || createTtyPromptAdapter({
      input: process.stdin,
      output: process.stdout,
    });

    const httpConfig = createHttpFamily();
    const formsConfig = createFormsFamily();

    try {
      // Shared engine preflight runs before either interactive decision. Forms
      // completes its route-aware family preflight inside migrateFormsFamily.
      preflightFamily(tree, httpConfig);
      const result = await migrateFamily(tree, httpConfig, prompts);
      reportResult(context, "HTTP", result);
    } catch (err) {
      if (err instanceof MigrationError) reportFailure(context, "HTTP", err);
      throw err;
    }

    try {
      const result = await migrateFormsFamily(tree, formsConfig, prompts);
      reportResult(context, "Forms", result);
    } catch (err) {
      if (err instanceof MigrationError) reportFailure(context, "Forms", err);
      throw err;
    }
  };
}

exports.default = default_1;
