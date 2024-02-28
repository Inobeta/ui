import { Injectable, Type } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { IbModalMessageComponent } from "./modal-message.component";
import type { IbModalMessage } from "./modal-message.model";

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
 * constructor(private modalService: IbModalMessageService) {}
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
@Injectable({ providedIn: "root" })
export class IbModalMessageService {
  constructor(private dialog: MatDialog) {}

  /**
   * Shows a modal message.
   *
   * Returns An observable that resolves with true or false, if the yes or no button was clicked.
   * Otherwise it'll resolve with the `value` parameter of an action.
   *
   * @param data Configuration for the modal message {@link IbModalMessage}
   * @param component The component to use as the content of the modal (default is {@link IbModalMessageComponent})
   */
  show(data: IbModalMessage, component: Type<any> = IbModalMessageComponent) {
    data.hasYes = data.hasYes === undefined ? true : data.hasYes;
    data.hasNo = data.hasNo === undefined ? true : data.hasNo;
    data.actions = data.actions || [];

    const dialogRef = this.dialog.open(component, {
      data,
    });

    return dialogRef.afterClosed();
  }
}
