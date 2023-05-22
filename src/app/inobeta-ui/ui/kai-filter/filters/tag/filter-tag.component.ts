import {
  Component,
  forwardRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { IbFilterBase } from "../base/filter-base";
import { IbFilter } from "../../filter.component";
import { MatSelectionList } from "@angular/material/list";
import { FormControl } from "@angular/forms";
import { IbFilterDef } from "../../filter.types";
import { eq, or } from "../../filters";

@Component({
  selector: "ib-filter-tag",
  templateUrl: "./filter-tag.component.html",
  styleUrls: ["./filter-tag.component.scss"],
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbFilterTag) },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class IbFilterTag extends IbFilterBase {
  @ViewChild(MatSelectionList) matSelectionList: MatSelectionList;

  private _options: Set<string> = new Set();

  searchCriteria = new FormControl([]);

  @Input() multiple = true;
  @Input()
  set options(value: string[]) {
    this._options = new Set(value);
  }

  get options() {
    return Array.from(this._options.values());
  }

  get displayValue() {
    const items = this.selected;
    if (!items || items?.length == 0) {
      return "";
    }

    if (items.length == 1) {
      return items[0].value;
    }
    return `${items[0].value} +${items.length}`;
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
    this.options = this.filter.ibTable.dataSource.data
      .map((x) => x[this.name])
      .sort((a, b) => (a > b ? 1 : -1));
  }

  applyFilter() {
    this.isDirty = true;

    if (!this.selected.length) {
      console.log('aaaaa')
      this.isDirty = false;
      this.searchCriteria.patchValue(null);
    }

    this.filter.update();
    this.button.closeMenu();
  }

  build = (): IbFilterDef =>
    this.selected.length ? or(this.selected.map((s) => eq(s.value))) : null;
}
