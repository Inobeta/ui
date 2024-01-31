import { StorybookTranslateModule } from ".storybook/i18n";
import { HttpClientModule } from "@angular/common/http";
import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { IbHttpModule } from "../http.module";
import { IbLoginService } from "./login.service";
import { IbAPITokens } from "./session.model";

const meta: Meta<IbLoginService<IbAPITokens>> = {
  title: "Features/HTTP/Login",
  component: IbLoginService,
  decorators: [
    moduleMetadata({
      imports: [HttpClientModule, StorybookTranslateModule, IbHttpModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<IbLoginService<IbAPITokens>>;

export const ibLoginService: Story = {
  render: () => ({
    template: ``,
  }),
};
