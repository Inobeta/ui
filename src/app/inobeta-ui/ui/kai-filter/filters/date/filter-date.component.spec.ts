import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDateRangeInputHarness } from "@angular/material/datepicker/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { MatRadioButtonHarness } from "@angular/material/radio/testing";
import { MatSelectHarness } from "@angular/material/select/testing";
import { By } from "@angular/platform-browser";
import { createFilterComponent } from "../../filter.component.spec";
import { and, gte, lte, none } from "../../filters";
import { IbDateFilter } from "./filter-date.component";

describe("IbDateFilter", () => {
  let fixture;
  let component: IbDateFilter;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = createFilterComponent(IbDateFilterApp);
    component = fixture.debugElement.query(
      By.directive(IbDateFilter)
    ).componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date("2023-07-25"));
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should build a noop filter", () => {
    expect(component.build()).toEqual(none());
  });

  it("should build a noop filter if invalid", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const button = await menu.getHarness(
      MatRadioButtonHarness.with({
        label: "shared.ibFilter.date.withinTheLast",
      })
    );
    await button.check();

    const value = await menu.getHarness(MatInputHarness);
    await value.setValue("-1");

    expect(component.build()).toEqual(none());
  });

  it("should build a filter (within)", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const button = await menu.getHarness(
      MatRadioButtonHarness.with({
        label: "shared.ibFilter.date.withinTheLast",
      })
    );
    await button.check();

    const condition = await menu.getHarness(MatSelectHarness);
    await condition.open();
    await condition.clickOptions({ text: "shared.ibFilter.date.days" });

    const value = await menu.getHarness(MatInputHarness);
    await value.setValue("1");

    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();

    const now = new Date();
    const then = new Date();
    then.setTime(now.getTime() - 1 * 60_000 * 60 * 24);
    expect(component.build()).toEqual(and([gte(then), lte(now)]));
  });

  it("should build a filter (more than)", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const button = await menu.getHarness(
      MatRadioButtonHarness.with({
        label: "shared.ibFilter.date.moreThan",
      })
    );
    await button.check();

    const section = await menu.getChildLoader(
      'section[formgroupname="moreThan"]'
    );
    const condition = await section.getHarness(MatSelectHarness);
    await condition.open();
    await condition.clickOptions({ text: "shared.ibFilter.date.daysAgo" });

    const value = await section.getHarness(MatInputHarness);
    await value.setValue("1");

    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();

    const now = new Date();
    const then = new Date();
    then.setTime(now.getTime() - 1 * 60_000 * 60 * 24);
    expect(component.build()).toEqual(lte(then));
  });

  it("should build a filter (range)", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const button = await menu.getHarness(
      MatRadioButtonHarness.with({
        label: "shared.ibFilter.date.between",
      })
    );
    await button.check();

    const section = await menu.getChildLoader('section[formgroupname="range"]');

    const inputRange = await section.getHarness(MatDateRangeInputHarness);
    const startInput = await inputRange.getStartInput();
    const endInput = await inputRange.getEndInput();
    await startInput.setValue("24/07/2023");
    await endInput.setValue("26/07/2023");

    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();

    const now = new Date();
    const start = new Date();
    const end = new Date();
    start.setTime(now.getTime() - 1 * 60_000 * 60 * 24);
    start.setHours(0);
    end.setTime(now.getTime() + 1 * 60_000 * 60 * 24);
    end.setHours(0);

    expect(component.build()).toEqual(and([gte(start), lte(end)]));
  });

  it("should not apply filter if invalid", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const button = await menu.getHarness(
      MatRadioButtonHarness.with({
        label: "shared.ibFilter.date.withinTheLast",
      })
    );
    await button.check();

    const section = await menu.getChildLoader(
      'section[formgroupname="within"]'
    );
    const value = await section.getHarness(MatInputHarness);
    await value.setValue("-1");

    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();
    const spyBuild = spyOn(component, "build");
    expect(spyBuild).not.toHaveBeenCalled();

    const previous = component.searchCriteria.getRawValue();
    component.clear();
    expect(component.searchCriteria.getRawValue()).not.toEqual(previous);
  });
});

@Component({
  template: `
    <ib-filter>
      <ib-date-filter name="updated"></ib-date-filter>
    </ib-filter>
  `,
})
class IbDateFilterApp {}
