import { StorybookTranslateModule } from ".storybook/i18n";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { provideIbHttp } from "../http.module";
import { IbLoginService } from "./login.service";
import { IbAPITokens } from "./session.model";

const meta: Meta<IbLoginService<IbAPITokens>> = {
  title: "Features/HTTP/Login",
  component: IbLoginService,
  decorators: [
    moduleMetadata({
      imports: [StorybookTranslateModule],
    }),
    applicationConfig({
      providers: [
        provideIbHttp()
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<IbLoginService<IbAPITokens>>;

export const ibLoginService: Story = {
  render: () => ({
    template: `Documentation only<br>This page is intentionally blank`,
  }),
};
