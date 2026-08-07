"use strict";

function createNonInteractivePromptAdapter() {
  return {
    isInteractive: false,
    async confirm() {
      return false;
    },
  };
}

function createTestPromptAdapter(answer) {
  return {
    isInteractive: true,
    async confirm() {
      return answer;
    },
  };
}

function createTtyPromptAdapter(options) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;

  return {
    isInteractive: Boolean(input.isTTY && output.isTTY),
    async confirm(message) {
      if (!this.isInteractive) {
        return false;
      }

      const readline = require("node:readline/promises");
      const terminal = readline.createInterface({ input, output });
      try {
        const answer = await terminal.question(`${message} [y/N] `);
        return /^(y|yes)$/i.test(answer.trim());
      } finally {
        terminal.close();
      }
    },
  };
}

module.exports = {
  createNonInteractivePromptAdapter,
  createTestPromptAdapter,
  createTtyPromptAdapter,
};
