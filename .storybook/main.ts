import type { StorybookConfig } from "@storybook/angular-vite";
import path from "path";
import { fileURLToPath } from "url";
import remarkGfm from "remark-gfm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    path.resolve(__dirname, "version-selector"),
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],

  framework: {
    name: "@storybook/angular-vite",
    options: {
      compodoc: false,
    },
  },
  docs: {},
  core: {
    disableTelemetry: true,
  },
  staticDirs: [{ from: "../src/assets", to: "assets" }],
  viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias["public_api"] = path.resolve(__dirname, "../public_api.ts");
    config.resolve.alias[".storybook/i18n"] = path.resolve(__dirname, "i18n.ts");
    return config;
  },
};
export default config;
