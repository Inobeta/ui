import { StorybookTranslateModule } from ".storybook/i18n";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  Meta,
  StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";
import { IbModalMessageService } from "./modal-message.service";
import { IbModalModule } from "./modal.module";

@Component({
  selector: "app-modal",
  template: `<button mat-button (click)="showModal()">Show Modal</button>`,
  standalone: true,
  imports: [MatButtonModule],
})
export class IbModalApp {
  constructor(private modalService: IbModalMessageService) {}

  showModal() {
    const modalData = {
      title: "Custom Modal",
      message: "This is a custom modal with actions.",
    };

    this.modalService.show(modalData).subscribe((result) => {
      if (result) {
        alert("Modal closed with result: " + result);
      }
    });
  }
}

@Component({
  selector: "app-modal-actions",
  template: `
    <button mat-button (click)="showModal()">Show Modal with Actions</button>
  `,
  standalone: true,
  imports: [MatButtonModule],
})
export class IbModalWithActionsApp {
  constructor(private modalService: IbModalMessageService) {}

  showModal() {
    const customActions = [
      { label: "Cancel", value: "cancel", color: "accent" },
      { label: "Next", value: "next", color: "primary" },
    ];

    const modalData = {
      title: "Custom Modal",
      message: "This is a custom modal with actions.",
      hasYes: false,
      hasNo: false,
      actions: customActions,
    };

    this.modalService.show(modalData).subscribe((result) => {
      if (result) {
        alert("Modal closed with result: " + result);
      }
    });
  }
}

const meta: Meta<IbModalMessageService> = {
  title: "Features/Modal",
  component: IbModalMessageService,
  decorators: [
    moduleMetadata({
      imports: [
        IbModalApp,
        IbModalWithActionsApp,
        IbModalModule,
        StorybookTranslateModule,
      ],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
};

export default meta;
type Story = StoryObj<IbModalMessageService>;

/**
 * Display modal messages
 *
 * Usage:
 * - Inject the `IbModalMessageService` service in your component or service.
 * - Call the `show` method to display a modal message.
 * - Subscribe to the returned observable to get the result of the modal message.
 *
 * Example:
 *
 * ```typescript
 * private modalService = inject(IbModalMessageService)
 *
 * showMessage() {
 *   const modalData: IbModalMessage = {
 *     title: 'product.delete.title',
 *     message: 'product.delete.description',
 *     hasYes: true,
 *     hasNo: true,
 *     actions: [] // Custom actions can be provided
 *   };
 *   this.modalService.show(modalData).subscribe((result) => {
 *     if (result) {
 *       // Do something
 *     }
 *   });
 * }
 * ```
 */
export const Documentation: Story = {
  render: () => ({
    template: `Documentation only<br>This page is intentionally blank`,
  }),
};

export const Simple: Story = {
  render: () => ({
    template: `<app-modal></app-modal>`,
  }),
};

export const WithActions: Story = {
  render: () => ({
    template: `<app-modal-actions></app-modal-actions>`,
  }),
};
