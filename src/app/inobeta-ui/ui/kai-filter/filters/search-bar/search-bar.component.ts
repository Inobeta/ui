import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { contains, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-search-bar",
  template: ` <mat-form-field
    [formGroup]="filter?.form"
    style="width: 100%; padding-bottom: 0"
  >
    <mat-icon matPrefix>search</mat-icon>
    <input
      matInput
      [formControlName]="name"
      (ngModelChange)="update()"
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
    <!-- <button matSuffix mat-icon-button (click)="showFilters()">
      <mat-icon>filter_alt</mat-icon>
    </button> -->
  </mat-form-field>`,
  providers: [{ provide: IbFilterBase, useExisting: IbSearchBar }],
})
export class IbSearchBar extends IbFilterBase {
  name = "__ibSearchBar";
  searchCriteria = new FormControl("");

  update() {
    this.applyFilter();
  }

  clear() {
    this.searchCriteria.reset();
  }

  build = () =>
    this.searchCriteria.value ? contains(this.searchCriteria.value) : none();
}
