import { LowerCasePipe, NgIf } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatRadioModule } from "@angular/material/radio";
import { TranslateModule } from "@ngx-translate/core";
import { IbFilterActionGroup } from "../../filter-button/filter-action-group.component";
import { IbFilterButton } from "../../filter-button/filter-button.component";
import { IbFilterDef } from "../../filter.types";
import { eq, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  standalone: true,
  imports: [
    NgIf,
    IbFilterButton,
    IbFilterActionGroup,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatRadioModule,
    TranslateModule,
    LowerCasePipe,
  ],
  selector: "ib-boolean-filter",
  templateUrl: "boolean-filter.component.html",
  providers: [{ provide: IbFilterBase, useExisting: IbBooleanFilter }],
})
export class IbBooleanFilter extends IbFilterBase {
  searchCriteria = new FormControl(null);

  get displayValue() {
    return this.rawValue;
  }

  build(): IbFilterDef {
    if (this.searchCriteria.value === null) {
      return none();
    }

    return eq(this.searchCriteria.value);
  }

  toQuery() {
    return this.searchCriteria.value;
  }
}
