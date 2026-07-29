import { Component, Input, booleanAttribute, inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs";
import { IbFilterOperator, IbTextQuery } from "../../filter.types";
import { contains, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "ib-search-bar",
  templateUrl: "search-bar.component.html",
  styleUrls: ["./search-bar.component.scss"],
  providers: [{ provide: IbFilterBase, useExisting: IbSearchBar }],
  standalone: false,
})
export class IbSearchBar extends IbFilterBase {
  name = "ibSearchBar";
  searchCriteria = new FormControl("", { nonNullable: true });
  private debounceTime = 0;

  translate = inject(TranslateService);

  @Input({ transform: booleanAttribute })
  set async(value: boolean) {
    if (value) {
      this.debounceTime = 300;
    } else {
      this.debounceTime = 0;
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.searchCriteria.valueChanges
      .pipe(debounceTime(this.debounceTime))
      .subscribe(() => {
        this.applyFilter();
      });
  }

  build = () =>
    this.searchCriteria.value ? contains(this.searchCriteria.value) : none();

  toQuery(): IbTextQuery {
    if (!this.searchCriteria.value) {
      return;
    }

    return {
      regex: `.*${this.searchCriteria.value}.*`,
      like: `%${this.searchCriteria.value}%`,
      condition: IbFilterOperator.CONTAINS,
      text: this.searchCriteria.value,
    };
  }

  mobileLabel(): string {
    return this.translate.instant('shared.ibFilter.fullTextSearch');
  }
}
