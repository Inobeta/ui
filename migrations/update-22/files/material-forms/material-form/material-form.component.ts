import { Component, Input, OnChanges, ChangeDetectionStrategy, SimpleChanges } from "@angular/core";
import { IbDynamicFormComponent } from "../../forms/dynamic-form/dynamic-form.component";
import { IbFormControlBase } from "../../forms/controls/form-control-base";

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
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IbMaterialFormComponent
  extends IbDynamicFormComponent
  implements OnChanges
{
  @Input() actionsPosition = IbMatActionsPosition.BOTTOM;
  @Input() rowHeight = "80px";
  simpleActions: IbFormControlBase<unknown>[] = [];
  submitAction: IbFormControlBase<unknown> | null = null;
  ibMatActionsPosition = IbMatActionsPosition;

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes.actions && changes.actions.currentValue) {
      const actions = changes.actions.currentValue as IbFormControlBase<unknown>[];
      this.simpleActions = actions.filter(
        (a) => a.key !== "submit"
      );
      this.submitAction = actions.find(
        (a) => a.key === "submit"
      ) ?? null;
    }
  }
}
