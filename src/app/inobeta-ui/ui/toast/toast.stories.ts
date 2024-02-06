import { StorybookTranslateModule } from ".storybook/i18n";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbToastModule } from "./toast.module";
import { IbToastNotification } from "./toast.service";

@Component({
  selector: "app-toast-service-host",
  template: `
    <mat-form-field style="width: 300px">
      <mat-label>Message</mat-label>
      <input matInput [(ngModel)]="message" />
    </mat-form-field>
    <br />
    <mat-form-field>
      <mat-label>Type</mat-label>
      <mat-select [(ngModel)]="type">
        <mat-option value="success">Success</mat-option>
        <mat-option value="error">error</mat-option>
        <mat-option value="warning">Warning</mat-option>
      </mat-select>
    </mat-form-field>
    <br />
    <mat-form-field>
      <mat-label>Horizontal Position</mat-label>
      <mat-select [(ngModel)]="horizontalPosition">
        <mat-option value="start">Start</mat-option>
        <mat-option value="center">Center</mat-option>
        <mat-option value="end">End</mat-option>
      </mat-select>
    </mat-form-field>
    <mat-form-field>
      <mat-label>Vertical Position</mat-label>
      <mat-select [(ngModel)]="verticalPosition">
        <mat-option value="top">Top</mat-option>
        <mat-option value="bottom">Bottom</mat-option>
      </mat-select>
    </mat-form-field>
    <br>
    <mat-form-field>
      <mat-label>Duration</mat-label>
      <input matInput [(ngModel)]="duration" type="number" />
    </mat-form-field>
    <br />
    <button mat-button (click)="openToast()">open toast</button>
  `,
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatSelectModule,
  ],
})
export class IbToastNotificationApp {
  private toast = inject(IbToastNotification);
  message = "This is a toast notification";
  type = "success";
  duration = 5000;
  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "top";

  openToast() {
    this.toast.open(
      this.message,
      this.type,
      this.duration,
      this.horizontalPosition,
      this.verticalPosition
    );
  }
}

const meta: Meta<IbToastNotification> = {
  title: "Features/Toast",
  component: IbToastNotification,
  decorators: [
    moduleMetadata({
      imports: [
        IbToastNotificationApp,
        IbToastModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default meta;
type Story = StoryObj<IbToastNotification>;

/**
 * Displays toast notifications
 *
 * Usage:
 * - Inject the `IbToastNotification` service in your component or service.
 * - Call the `open` method to display a toast notification.
 *
 * Example:
 *
 * ```typescript
 * constructor(private toastService: IbToastNotification) {}
 *
 * showMessage() {
 *   this.toastService.open('Message sent successfully!', 'success');
 * }
 * ```
 */
export const Documentation: Story = {
  render: () => ({
    template: `Documentation only<br>This page is intentionally blank`,
  }),
};

export const Example: StoryObj<IbToastNotificationApp> = {
  render: () => ({
    template: `<app-toast-service-host></app-toast-service-host>`,
  }),
};
