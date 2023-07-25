import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";
import { IbNumberFilter } from "../..";
import { createFilterComponent } from "../../filter.component.spec";
import { and, gte, lte, none } from "../../filters";
import { MatSliderHarness } from "@angular/material/slider/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

fdescribe("IbNumberFilter", () => {
  let fixture;
  let component: IbNumberFilter;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = createFilterComponent(IbNumberFilterApp);
    component = fixture.debugElement.query(
      By.directive(IbNumberFilter)
    ).componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should build a noop filter if default", () => {
    const filter = component.build();
    expect(filter).toEqual(none());
  });

  it("should build a filter", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const slider = await menu.getHarness(MatSliderHarness);
    const startThumb = await slider.getStartThumb();
    const endThumb = await slider.getEndThumb();
    expect(await startThumb.getValue()).toBe(component.min);
    expect(await endThumb.getValue()).toBe(component.max);

    await startThumb.setValue(50);
    await endThumb.setValue(75);

    const apply = await menu.getHarness(
      MatButtonHarness.with({ ancestor: "ib-apply-filter-button" })
    );
    await apply.click();
    expect(component.build()).toEqual(and([gte(50), lte(75)]));
  });

  it("should reset on clear", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const slider = await menu.getHarness(MatSliderHarness);
    const startThumb = await slider.getStartThumb();
    const endThumb = await slider.getEndThumb();
    expect(await startThumb.getValue()).toBe(component.min);
    expect(await endThumb.getValue()).toBe(component.max);

    await startThumb.setValue(50);
    await endThumb.setValue(75);

    const clear = await menu.getHarness(
      MatButtonHarness.with({ ancestor: "ib-clear-filter-button" })
    );
    const apply = await menu.getHarness(
      MatButtonHarness.with({ ancestor: "ib-apply-filter-button" })
    );
    await apply.click();
    expect(component.build()).toEqual(and([gte(50), lte(75)]));

    await clear.click();
    expect(component.build()).toEqual(none());
  });
});

@Component({
  template: `
    <ib-filter>
      <ib-number-filter name="price" [min]="0" [max]="100"></ib-number-filter>
    </ib-filter>
  `,
})
class IbNumberFilterApp {}
