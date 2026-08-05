import { HttpClientModule } from "@angular/common/http";
import { importProvidersFrom } from "@angular/core";
import { applicationConfig, type Preview } from "@storybook/angular-vite";
import { version } from '../package.json'
const [major, minor, patch] = version.split('.')

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: {
        headingSelector: 'h2, h3',
        ignoreSelector: '#primary, #stories'
      }
    },
    options: {
      storySort: {
        order: ['Getting started', 'Components', 'Features']
      }
    },
    version: {
      major,
      minor,
      patch,
      style: {
        color: 'navy',
        'font-weight': '900',
        'font-size': '24px'
      }
    }
  },
  decorators: [
    applicationConfig({
      providers: [importProvidersFrom(HttpClientModule)],
    }),
  ],
};

export default preview;
