import { StorybookTranslateModule } from ".storybook/i18n";
import { provideAnimations } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbBreadcrumbModule } from "./breadcrumb.module";
import { IbMaterialBreadcrumbComponent } from "./material-breadcrumb/material-breadcrumb.component";

const meta: Meta<IbMaterialBreadcrumbComponent> = {
  title: "Breadcrumbs",
  component: IbMaterialBreadcrumbComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        IbBreadcrumbModule,
        RouterTestingModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  parameters: {
    controls: {
      include: ["home", "items", "mode"],
    },
  },
};

export default meta;
type Story = StoryObj<IbMaterialBreadcrumbComponent>;

export const StaticMode: Story = {
  args: {
    items: [
      {
        url: "about-us",
        label: "About us",
      },
    ],
    mode: "static",
  },
};
