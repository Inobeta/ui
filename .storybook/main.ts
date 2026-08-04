import type { StorybookConfig } from "@storybook/angular";
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    './version-selector',
    "@storybook/addon-mdx-gfm",
    "@storybook/addon-docs"
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
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        html2canvas: false,
        dompurify: false,
        canvg: false,
      };
    }
    return config;
  },
};
export default config;
