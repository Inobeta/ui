import { StorybookTranslateModule } from ".storybook/i18n";
import { Validators } from "@angular/forms";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbMatButtonControl } from "./controls/button";
import { IbMatDropdownControl } from "./controls/dropdown";
import { IbMatSlideToggleControl } from "./controls/slide-toggle";
import { IbMatTextboxControl } from "./controls/textbox";
import { IbMaterialFormModule } from "./material-form.module";
import { IbMaterialFormComponent } from "./material-form/material-form.component";
import { IbFormArray } from "../forms/array/array";
import { IbMatLabelControl } from "./controls/label";

const meta: Meta = {
  title: "Forms",
  component: IbMaterialFormComponent,
  decorators: [
    moduleMetadata({
      imports: [IbMaterialFormModule, StorybookTranslateModule],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  argTypes: {
    fields: { control: { disable: true } },
    actions: { control: { disable: true } },
    ibSubmit: { control: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<IbMaterialFormComponent>;

const render = (props) => ({
  props: {
    ...props,
  },
  template: `<ib-material-form [fields]="fields" [actions]="actions" [value]="value" (ibSubmit)="ibSubmit($event)" />`,
});

export const Textbox: Story = {
  render,
  args: {
    fields: [
      new IbMatTextboxControl({
        key: "fullName",
        label: "Full name",
        value: ""
      }),
    ],
  },
};

export const Dropdown: Story = {
  render,
  args: {
    fields: [
      new IbMatDropdownControl({
        key: "theme",
        label: "Theme",
        options: [
          { key: "auto", value: "System default" },
          { key: "light", value: "Light" },
          { key: "dark", value: "Dark" },
        ],
      }),
    ],
  },
};

export const SimpleLogin: Story = {
  render,
  args: {
    fields: [
      new IbMatTextboxControl({
        key: "email",
        label: "Email",
        type: "email",
        validators: [Validators.email, Validators.required],
        width: "100%",
      }),
      new IbMatTextboxControl({
        key: "password",
        label: "Password",
        type: "password",
        validators: [Validators.required],
        width: "100%",
      }),
      new IbMatSlideToggleControl({
        key: "storeUserAgent",
        label: "Remember this device",
        width: "100%",
      }),
    ],
    actions: [
      new IbMatButtonControl({
        key: "submit",
        label: "Login",
      }),
    ],
  },
};

export const WithFormArray: Story = {
  render,
  args: {
    fields: [
      new IbMatTextboxControl({
        key: "fullName",
        label: "Full name",
      }),
      new IbMatLabelControl({
        value: "Fields",
        width: "100%",
      }),
      new IbFormArray({
        key: "addresses",
        options: {
          max: 2,
        },
        fields: [
          new IbMatTextboxControl({
            key: "key",
            label: "(es. Phone, Email)",
            width: "25%",
          }),
          new IbMatTextboxControl({
            key: "value",
            label: "es. +39123123",
            validators: [Validators.required],
            width: "25%",
          }),
        ],
      }),
    ],
    actions: [
      new IbMatButtonControl({
        key: "submit",
        label: "Add contact",
      }),
    ],
  },
};
