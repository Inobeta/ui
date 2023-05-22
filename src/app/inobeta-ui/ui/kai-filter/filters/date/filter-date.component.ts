import { Component, ViewEncapsulation, forwardRef } from "@angular/core";
import { IbFilterBase } from "../base/filter-base";
import { IbFilterDef } from "../../filter.types";
import { FormGroup, FormControl } from "@angular/forms";
import { and, gte, lte, none } from "../../filters";
import { formatDate } from "@angular/common";

enum IbDateFilterCriteriaCategory {
  WITHIN = 1,
  MORE_THAN,
  RANGE,
}

enum IbDateFilterPeriod {
  MINUTES = 1,
  HOURS,
  DAYS,
  WEEKS,
}

@Component({
  selector: "ib-filter-date, ib-date-filter",
  templateUrl: "filter-date.component.html",
  styleUrls: ["./filter-date.component.scss"],
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbFilterDate) },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class IbFilterDate extends IbFilterBase {
  searchCriteria = new FormGroup({
    categorySelected: new FormControl(0),
    within: new FormGroup({
      value: new FormControl(),
      period: new FormControl(IbDateFilterPeriod.MINUTES),
    }),
    moreThan: new FormGroup({
      value: new FormControl(),
      period: new FormControl(IbDateFilterPeriod.MINUTES),
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
    if (this.isSelected(IbDateFilterCriteriaCategory.WITHIN)) {
      return !!this.searchCriteria.value.within.value;
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.MORE_THAN)) {
      return !!this.searchCriteria.value.moreThan.value;
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.RANGE)) {
      return (
        this.searchCriteria.value.range.start &&
        this.searchCriteria.value.range.end
      );
    }
  }

  get displayValue() {
    if (this.isSelected(IbDateFilterCriteriaCategory.WITHIN)) {
      return this.searchCriteria.value.within.value;
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.MORE_THAN)) {
      return this.searchCriteria.value.moreThan.value;
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.RANGE)) {
      if (
        !this.searchCriteria.value.range.start ||
        !this.searchCriteria.value.range.end
      ) {
        return;
      }
      const start = formatDate(
        this.searchCriteria.value.range.start,
        "dd/MM/YYYY",
        "en"
      );
      const end = formatDate(
        this.searchCriteria.value.range.end,
        "dd/MM/YYYY",
        "en"
      );
      return `${start} - ${end}`;
    }

    return;
  }

  get displayPeriod() {
    if (this.isSelected(IbDateFilterCriteriaCategory.WITHIN)) {
      return this.withinPeriodOptions.find(
        (o) => o.value === this.searchCriteria.value.within.period
      )?.displayValue;
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.MORE_THAN)) {
      return this.moreThanPeriodOptions.find(
        (o) => o.value === this.searchCriteria.value.moreThan.period
      )?.displayValue;
    }

    return;
  }

  get displayCondition() {
    if (this.isSelected(IbDateFilterCriteriaCategory.WITHIN)) {
      return "shared.ibFilter.date.withinTheLast";
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.MORE_THAN)) {
      return "shared.ibFilter.date.moreThan";
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.RANGE)) {
      return "shared.ibFilter.date.between";
    }
  }

  isSelected(category) {
    return this.searchCriteria.value.categorySelected === category;
  }

  applyFilter(): void {
    if (this.searchCriteria.invalid) {
      return;
    }
    this.filter.update();
    this.button.closeMenu();
  }

  clear(): void {
    const defaultPeriod = {
      period: IbDateFilterPeriod.MINUTES,
      value: null,
    };
    this.searchCriteria.reset({
      within: defaultPeriod,
      moreThan: defaultPeriod,
    });
    this.filter.update();
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
    if (this.isSelected(IbDateFilterCriteriaCategory.WITHIN)) {
      return this.buildWithinCategory();
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.MORE_THAN)) {
      return this.buildMoreThanCategory();
    }

    if (this.isSelected(IbDateFilterCriteriaCategory.RANGE)) {
      return this.buildRangeCategory();
    }

    return none();
  };
}
