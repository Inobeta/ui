import { formatDate } from "@angular/common";
import { Component, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { TranslateService } from "@ngx-translate/core";
import { IbFilter } from "../../filter.component";
import {
  IbDateFilterCategory,
  IbDateFilterPeriod,
  IbFilterDef,
} from "../../filter.types";
import { and, gte, lte, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-date-filter",
  templateUrl: "filter-date.component.html",
  styleUrls: ["./filter-date.component.scss"],
  providers: [{ provide: IbFilterBase, useExisting: IbDateFilter }],
  encapsulation: ViewEncapsulation.None,
})
export class IbDateFilter extends IbFilterBase {
  searchCriteria = new FormGroup({
    categorySelected: new FormControl(null, [Validators.required]),
    within: new FormGroup({
      value: new FormControl(null, [Validators.min(1)]),
      period: new FormControl(IbDateFilterPeriod.MINUTES, {
        nonNullable: true,
      }),
    }),
    moreThan: new FormGroup({
      value: new FormControl(null, [Validators.min(1)]),
      period: new FormControl(IbDateFilterPeriod.MINUTES, {
        nonNullable: true,
      }),
    }),
    range: new FormGroup({
      start: new FormControl(null),
      end: new FormControl(null),
    }),
  });

  withinPeriodOptions = [
    {
      displayValue: "shared.ibFilter.date.minutes",
      value: IbDateFilterPeriod.MINUTES,
    },
    {
      displayValue: "shared.ibFilter.date.hours",
      value: IbDateFilterPeriod.HOURS,
    },
    {
      displayValue: "shared.ibFilter.date.days",
      value: IbDateFilterPeriod.DAYS,
    },
    {
      displayValue: "shared.ibFilter.date.weeks",
      value: IbDateFilterPeriod.WEEKS,
    },
  ];

  moreThanPeriodOptions = [
    {
      displayValue: "shared.ibFilter.date.minutesAgo",
      value: IbDateFilterPeriod.MINUTES,
    },
    {
      displayValue: "shared.ibFilter.date.hoursAgo",
      value: IbDateFilterPeriod.HOURS,
    },
    {
      displayValue: "shared.ibFilter.date.daysAgo",
      value: IbDateFilterPeriod.DAYS,
    },
    {
      displayValue: "shared.ibFilter.date.weeksAgo",
      value: IbDateFilterPeriod.WEEKS,
    },
  ];

  private multipliers = {
    [IbDateFilterPeriod.MINUTES]: 60_000,
    [IbDateFilterPeriod.HOURS]: 60_000 * 60,
    [IbDateFilterPeriod.DAYS]: 60_000 * 60 * 24,
    [IbDateFilterPeriod.WEEKS]: 60_000 * 60 * 24 * 7,
  };

  get isDirty() {
    if (this.getSelected()?.invalid) {
      return false;
    }

    if (this.isSelected(IbDateFilterCategory.WITHIN)) {
      return !!this.rawValue?.within?.value;
    }

    if (this.isSelected(IbDateFilterCategory.MORE_THAN)) {
      return !!this.rawValue?.moreThan?.value;
    }

    if (this.isSelected(IbDateFilterCategory.RANGE)) {
      return this.rawValue?.range?.start && this.rawValue?.range?.end;
    }
  }

  get displayValue() {
    if (this.isSelected(IbDateFilterCategory.WITHIN)) {
      return this.rawValue?.within?.value;
    }

    if (this.isSelected(IbDateFilterCategory.MORE_THAN)) {
      return this.rawValue?.moreThan?.value;
    }

    if (this.isSelected(IbDateFilterCategory.RANGE)) {
      if (!this.rawValue?.range?.start || !this.rawValue?.range?.end) {
        return;
      }
      const start = formatDate(this.rawValue?.range?.start, "dd/MM/YYYY", "en");
      const end = formatDate(this.rawValue?.range?.end, "dd/MM/YYYY", "en");
      return `${start} - ${end}`;
    }

    return;
  }

  get displayPeriod() {
    if (this.isSelected(IbDateFilterCategory.WITHIN)) {
      return this.withinPeriodOptions.find(
        (o) => o.value === this.rawValue?.within?.period
      )?.displayValue;
    }

    if (this.isSelected(IbDateFilterCategory.MORE_THAN)) {
      return this.moreThanPeriodOptions.find(
        (o) => o.value === this.rawValue?.moreThan?.period
      )?.displayValue;
    }

    return;
  }

  get displayCondition() {
    if (this.isSelected(IbDateFilterCategory.WITHIN)) {
      return "shared.ibFilter.date.withinTheLast";
    }

    if (this.isSelected(IbDateFilterCategory.MORE_THAN)) {
      return "shared.ibFilter.date.moreThan";
    }

    if (this.isSelected(IbDateFilterCategory.RANGE)) {
      return "shared.ibFilter.date.between";
    }
  }

  constructor(
    public filter: IbFilter,
    private adapter: DateAdapter<any>,
    private translate: TranslateService
  ) {
    super(filter);
    this.adapter.setLocale(this.translate.currentLang);
    this.translate.onTranslationChange.subscribe((ev) => {
      this.adapter.setLocale(ev.lang);
    });
  }

  isSelected(category) {
    return this.searchCriteria.value.categorySelected === category;
  }

  getSelected() {
    return this.searchCriteria?.get(this.searchCriteria.value.categorySelected);
  }

  applyFilter(): void {
    this.searchCriteria.updateValueAndValidity();
    if (this.getSelected()?.invalid) {
      this.searchCriteria.markAllAsTouched();
      return;
    }

    const categorySelected = this.searchCriteria?.value.categorySelected;
    const patch = {
      [categorySelected]: this.getSelected()?.value,
      categorySelected,
    };

    this.clearFilter(patch);
    this.filter.update();
    this.button.closeMenu();
  }

  clearFilter(patchValue = {}) {
    const defaultPeriod = {
      period: IbDateFilterPeriod.MINUTES,
      value: null,
    };
    this.searchCriteria.reset({
      within: defaultPeriod,
      moreThan: defaultPeriod,
      ...patchValue,
    });
  }

  clear(update = true): void {
    this.clearFilter();
    update && this.filter.update();
  }

  private getOffsetTime(value: number, category) {
    const now = new Date();
    const then = new Date();
    const multiplier = this.multipliers[category.period];

    then.setTime(now.getTime() - value * multiplier);
    return [then, now];
  }

  private buildWithinCategory() {
    const value = this.searchCriteria.value.within.value;
    if (!value) {
      return none();
    }

    const [then, now] = this.getOffsetTime(
      value,
      this.searchCriteria.value.within
    );

    return and([gte(then), lte(now)]);
  }

  private buildMoreThanCategory() {
    const value = this.searchCriteria.value.moreThan.value;
    if (!value) {
      return none();
    }

    const [then] = this.getOffsetTime(
      value,
      this.searchCriteria.value.moreThan
    );

    return lte(then);
  }

  private buildRangeCategory() {
    const start = this.searchCriteria.value.range.start;
    const end = this.searchCriteria.value.range.end;
    if (!start || !end) {
      return none();
    }

    return and([gte(start), lte(end)]);
  }

  build = (): IbFilterDef => {
    if (this.getSelected()?.invalid) {
      return none();
    }

    if (this.isSelected(IbDateFilterCategory.WITHIN)) {
      return this.buildWithinCategory();
    }

    if (this.isSelected(IbDateFilterCategory.MORE_THAN)) {
      return this.buildMoreThanCategory();
    }

    if (this.isSelected(IbDateFilterCategory.RANGE)) {
      return this.buildRangeCategory();
    }

    return none();
  };
}
