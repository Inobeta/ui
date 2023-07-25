import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { By } from "@angular/platform-browser";
import { IbTextFilter } from "../..";
import { createFilterComponent } from "../../filter.component.spec";
import { MatInputHarness } from "@angular/material/input/testing";
import { contains, eq, none } from "../../filters";
import { MatSelectHarness } from "@angular/material/select/testing";

describe("IbTextFilter", () => {
  let fixture;
  let component: IbTextFilter;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = createFilterComponent(IbTextFilterApp);
    component = fixture.debugElement.query(
      By.directive(IbTextFilter)
    ).componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should build a filter", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    
    const value = await menu.getHarness(MatInputHarness);
    await value.setValue("test");

    const apply = await menu.getHarness(
      MatButtonHarness.with({ ancestor: "ib-apply-filter-button" })
    );
    await apply.click();
    expect(component.build()).toEqual(contains("test"));
  });

  it("should reset on clear", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    
    const condition = await menu.getHarness(MatSelectHarness);
    await condition.open();
    const options = await condition.getOptions();
    await options[0].click();

    const value = await menu.getHarness(MatInputHarness);
    await value.setValue("test");

    const clear = await menu.getHarness(
      MatButtonHarness.with({ ancestor: "ib-clear-filter-button" })
    );
    const apply = await menu.getHarness(
      MatButtonHarness.with({ ancestor: "ib-apply-filter-button" })
    );
    await apply.click();
    expect(component.build()).toEqual(eq("test"))
    await clear.click();
    expect(component.build()).toEqual(none())
    expect(component.searchCriteria.value).toEqual(contains("") as any)
  });
});

@Component({
  template: `
    <ib-filter>
      <ib-text-filter name="sku"></ib-text-filter>
    </ib-filter>
  `,
})
class IbTextFilterApp {}
