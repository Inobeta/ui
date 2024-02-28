import { Component, Input, OnChanges } from "@angular/core";
import { IbDynamicFormComponent } from "../../forms/dynamic-form/dynamic-form.component";

/**
 * Crea un form dinamico usando componenti di Angular Material.
 *
 * @example
 * <ib-material-form
 *             [fields]="loginFormFields"
 *             (ibSubmit)="onSubmit($event)"></ib-material-form>
 */

export enum IbMatActionsPosition {
  BOTH,
  TOP,
  BOTTOM,
}

@Component({
  selector: "ib-material-form",
  templateUrl: "./material-form.component.html",
})
export class IbMaterialFormComponent
  extends IbDynamicFormComponent
  implements OnChanges
{
  @Input() actionsPosition = IbMatActionsPosition.BOTTOM;
  @Input() rowHeight = "80px";
  simpleActions = [];
  submitAction = null;
  ibMatActionsPosition = IbMatActionsPosition;

  ngOnChanges(changes) {
    super.ngOnChanges(changes);
    if (changes.actions && changes.actions.currentValue) {
      this.simpleActions = changes.actions.currentValue.filter(
        (a) => a.key !== "submit"
      );
      this.submitAction = changes.actions.currentValue.find(
        (a) => a.key === "submit"
      );
    }
  }
}
