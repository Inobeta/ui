import {Component, Input} from '@angular/core';

@Component({
  selector: 'ib-table-menu-actions',
  template: `
    <div fxLayout="row"
         fxLayoutAlign="center center"
         *ngIf="hasActions"
         style="
          border: 1px solid gray;
          border-radius: 20px;
          padding: 5px 15px 5px 10px;">
      <i
        class="material-icons">touch_app
      </i> {{ 'shared.ui.table.actions' | translate }}
      <i
        class="material-icons"
        style="cursor:pointer;"
        [matMenuTriggerFor]="menuTableActions">keyboard_arrow_down
      </i>
    </div>
  `,
})
export class IbTableMenuActionsComponent {
  @Input() hasActions;
  @Input() menuTableActions;
  @Input() actionsLength;
}
