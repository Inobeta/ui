import { StorybookTranslateModule } from ".storybook/i18n";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";

import { Component, inject } from "@angular/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { IbFormControlErrors } from "./form-control-errors.component";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { IbPatchFormValue } from "public_api";

@Component({
  selector: "ib-form-story",
  template: ``,
})
class IbFormStoryComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    name: [""],
    surname: [""],
  });
}

const meta: Meta<IbFormStoryComponent> = {
  title: "Components/Forms (new)",
  component: IbFormStoryComponent,
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        StorybookTranslateModule,
        IbFormControlErrors,
        IbPatchFormValue,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default meta;
type Story = StoryObj<IbFormStoryComponent>;

export const Example: Story = {
  render: () => ({
    template: `
    <form class="ib-form" [formGroup]="form">
      <section class="ib-form-row">
        <mat-form-field>
          <mat-label>Name</mat-label>
          <input matInput type="text" formControlName="name" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Surname</mat-label>
          <input matInput type="text" formControlName="surname" />
        </mat-form-field>
      </section>

      <span class="mat-body-large">Contacts</span>
      <mat-form-field>
        <mat-label>Address</mat-label>
        <input matInput type="text" />
      </mat-form-field>
      <section class="ib-form-row">
        <mat-form-field>
          <mat-label>Country</mat-label>
          <mat-select>
            <mat-option value="">US</mat-option>
            <mat-option value="">Italy</mat-option>
            <mat-option value="">Germany</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Phone number</mat-label>
          <input matInput type="text" />
        </mat-form-field>
      </section>
    </form>`,
  }),
};

export const GrowVertically: Story = {
  render: () => ({
    template: `
    <form class="ib-form">
      <mat-form-field>
        <mat-label>Field #1</mat-label>
        <input matInput type="text">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Field #2</mat-label>
        <input matInput type="text">
      </mat-form-field>
      <mat-form-field>
        <mat-label>Field #3</mat-label>
        <input matInput type="text">
      </mat-form-field>
      <section class="ib-form-row">
        <mat-form-field>
          <mat-label>Field #4</mat-label>
          <mat-select>
            <mat-option value="">US</mat-option>
            <mat-option value="">Italy</mat-option>
            <mat-option value="">Germany</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Field #5</mat-label>
          <input matInput type="text">
        </mat-form-field>
      </section>
    </form>`,
  }),
};

export const WithFormErrors: Story = {
  render: (props) => ({
    props: {
      form: new FormGroup({
        name: new FormControl("", [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(8),
        ]),
      }),
    },
    template: `
    <form class="ib-form" [formGroup]="form">
      <mat-form-field>
        <mat-label>Username</mat-label>
        <input matInput type="text" formControlName="name">
        <mat-error>
          <ib-form-control-errors for="name" />
        </mat-error>
      </mat-form-field>
    </form>`,
  }),
};
