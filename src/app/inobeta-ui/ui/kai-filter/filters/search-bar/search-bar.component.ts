import { Component, Input, booleanAttribute } from "@angular/core";
import { FormControl } from "@angular/forms";
import { debounceTime } from "rxjs";
import { IbFilterOperator, IbTextQuery } from "../../filter.types";
import { contains, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-search-bar",
  template: `<mat-form-field
    [formGroup]="filter?.form"
    style="width: 100%; padding-bottom: 0"
  >
    <mat-icon matPrefix>search</mat-icon>
    <input
      matInput
      [formControlName]="name"
      [placeholder]="'shared.ibFilter.search' | translate"
    />
    <button
      *ngIf="searchCriteria.value"
      matSuffix
      mat-icon-button
      (click)="clear()"
    >
      <mat-icon>close</mat-icon>
    </button>
  </mat-form-field>`,
  providers: [{ provide: IbFilterBase, useExisting: IbSearchBar }],
})
export class IbSearchBar extends IbFilterBase {
  name = "ibSearchBar";
  searchCriteria = new FormControl("", { nonNullable: true });
  private debounceTime = 0;

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
}
