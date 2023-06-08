import {
  Component,
  forwardRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatSelectionList } from "@angular/material/list";
import { IbFilterDef } from "../../filter.types";
import { eq, or } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-tag-filter",
  templateUrl: "./filter-tag.component.html",
  styleUrls: ["./filter-tag.component.scss"],
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbTagFilter) },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class IbTagFilter extends IbFilterBase {
  @ViewChild(MatSelectionList) matSelectionList: MatSelectionList;

  private _options: Set<string> = new Set();

  searchCriteria = new FormControl([]);

  @Input() multiple = true;
  @Input()
  set options(value: string[]) {
    value = value.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1));
    this._options = new Set(value);
  }

  get options() {
    return Array.from(this._options);
  }

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

  ngOnInit() {
    super.ngOnInit();
    if (!this._options.size && this.filter?.ibTable) {
      this.populateOptionsFromColumn();
    }
  }

  populateOptionsFromColumn() {
    this.options = this.filter.ibTable.dataSource.data.map((x) => x[this.name]);
  }

  applyFilter() {
    if (!this.selected.length) {
      this.searchCriteria.patchValue(null);
    }

    this.filter.update();
    this.button.closeMenu();
  }

  build = (): IbFilterDef =>
    this.selected?.length ? or(this.selected.map((s) => eq(s.value))) : null;
}
