import { Component, Input, ViewChild, ViewEncapsulation, computed } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSelectionList } from "@angular/material/list";
import { IbFilterDef } from "../../filter.types";
import { eq, none, or } from "../../filters";
import { IbFilterBase } from "../base/filter-base";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "ib-tag-filter",
  templateUrl: "./filter-tag.component.html",
  styleUrls: ["./filter-tag.component.scss"],
  providers: [{ provide: IbFilterBase, useExisting: IbTagFilter }],
  encapsulation: ViewEncapsulation.None,
})
export class IbTagFilter extends IbFilterBase {
  @ViewChild(MatSelectionList) matSelectionList: MatSelectionList;

  searchCriteria = new FormControl([], { nonNullable: true });

  @Input() multiple = true;
  @Input()
  set options(value: string[]) {
    this.isSetByUser = true;
    this.setOptions(value);
  }
  get options() {
    return Array.from(this._options);
  }
  private _options: Set<string> = new Set();
  private isSetByUser = false;

  query: string;

  get displayLabel() {
    if (this.rawValue?.length == 1) {
      return "shared.ibFilter.label.tag.singleItem";
    }

    if (this.rawValue?.length > 1) {
      return "shared.ibFilter.label.tag.multipleItems";
    }

    return "";
  }

  get displayLabelParams() {
    return {
      item: this.displayValue,
      length: this.rawValue?.length - 1,
    };
  }

  get displayValue() {
    return this.rawValue?.length && this.rawValue[0];
  }

  get selected() {
    return this.matSelectionList?.selectedOptions?.selected;
  }

  initializeFromColumn(data: any[]) {
    if (!this.isSetByUser) {
      this.setOptions(data.map((x) => x[this.name]));
    }
  }

  private setOptions(options: string[]) {
    options = options.sort((a, b) =>
      a.toLowerCase() > b.toLowerCase() ? 1 : -1
    );
    this._options = new Set(options);
  }

  applyFilter() {
    this.filter.update();
    this.button.closeMenu();
    this.query = "";
  }

  revertFilter(): void {
    this.query = "";
    super.revertFilter();
  }

  build = (): IbFilterDef =>
    this.selected?.length ? or(this.selected.map((s) => eq(s.value))) : none();
}
