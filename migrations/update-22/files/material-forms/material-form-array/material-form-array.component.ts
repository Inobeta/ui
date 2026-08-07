import { Component, ChangeDetectionStrategy } from "@angular/core";
import { IbDynamicFormArrayComponent } from "../../forms/dynamic-form-array/dynamic-form-array.component";

@Component({
    selector: "ib-material-form-array",
    templateUrl: "material-form-array.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IbMaterialFormArrayComponent extends IbDynamicFormArrayComponent {
  get addFieldLabel(): string | undefined {
    return this.base.options.addFieldLabel;
  }
}
