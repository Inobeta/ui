import type { StorybookConfig } from "@storybook/angular";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    './version-selector',
    "@storybook/addon-mdx-gfm"
  ],

  framework: {
    name: "@storybook/angular",
    options: {},
  },
  docs: {},
  core: {
    disableTelemetry: true,
  },
  staticDirs: [{ from: "../src/assets", to: "assets" }],
};
export default config;
