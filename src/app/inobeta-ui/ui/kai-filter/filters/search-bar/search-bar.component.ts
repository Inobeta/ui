import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
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
      (keyup)="applyFilter()"
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

  build = () =>
    this.searchCriteria.value ? contains(this.searchCriteria.value) : none();
}
