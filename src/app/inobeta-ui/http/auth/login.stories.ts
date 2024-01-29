import { StorybookTranslateModule } from ".storybook/i18n";
import { HttpClientModule } from "@angular/common/http";
import { MatNativeDateModule } from "@angular/material/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { IbLoginService } from "./login.service";
import { IbAPITokens } from "./session.model";
import { IbHttpModule } from "../http.module";

const meta: Meta<IbLoginService<IbAPITokens>> = {
  title: "Features/HTTP",
  component: IbLoginService,
  decorators: [
    moduleMetadata({
      imports: [
        HttpClientModule,
        StorybookTranslateModule,
        IbHttpModule
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default meta;
type Story = StoryObj<IbLoginService<IbAPITokens>>;

export const ibLoginService: Story = {
  render: () => ({
    template: ``
  })
}