import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IView } from "../../view.types";

@Component({
    selector: "ib-view-list",
    templateUrl: "./view-list.component.html",
    styleUrls: ["./view-list.component.scss"],
    standalone: false
})
export class IbViewList {
  @Input() defaultView!: IView;
  @Input() activeView!: IView;
  @Input() views: IView[] = [];
  @Input() dirty = false;

  @Output() ibAddView = new EventEmitter<void>();
  @Output() ibRemoveView = new EventEmitter<IView>();
  @Output() ibRenameView = new EventEmitter<IView>();
  @Output() ibDuplicateView = new EventEmitter<IView>();
  @Output() ibChangeView = new EventEmitter<IView>();
  @Output() ibReorderViews = new EventEmitter<IView[]>();

  /** Named views only (Default and Add button are outside the drop list). */
  get namedViews(): IView[] {
    return this.views ?? [];
  }

  /**
   * Handles the CDK drag-and-drop event.
   *
   * Only named views participate in the drop list; Default and the Add
   * button are rendered outside it and never moved.
   */
  onDrop(event: CdkDragDrop<IView[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const reordered = [...this.namedViews];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);
    this.ibReorderViews.emit(reordered);
  }
}
