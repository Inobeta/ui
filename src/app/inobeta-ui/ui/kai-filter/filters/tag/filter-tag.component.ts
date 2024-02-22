import { Component, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSelectionList } from "@angular/material/list";
import { IbFilterDef, IbTagQuery } from "../../filter.types";
import { eq, none, or } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-tag-filter",
  templateUrl: "./filter-tag.component.html",
  styleUrls: ["./filter-tag.component.scss"],
  providers: [{ provide: IbFilterBase, useExisting: IbTagFilter }],
  encapsulation: ViewEncapsulation.None,
})
export class IbTagFilter extends IbFilterBase {
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

  query = "";

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

  initializeFromColumn(data: any[]) {
    if (!this.isSetByUser) {
      this.setOptions(data.map((x) => x[this.name]));
    }
  }

  private setOptions(options: string[]) {
    this._options = new Set(
      options
        .map((a) => a)
        .sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1))
    );
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
    this.searchCriteria?.value.length
      ? or(this.searchCriteria.value.map((s) => eq(s)))
      : none();

  toQuery(): IbTagQuery {
    const items = this.searchCriteria?.value
      ? this.searchCriteria?.value.map((s) => s)
      : [];
    return {
      items,
      joined: items.join(","),
    };
  }
}
