import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component, inject } from "@angular/core";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { MatSelectHarness } from "@angular/material/select/testing";
import { By } from "@angular/platform-browser";
import { IbTextFilter } from "../..";
import { createFilterComponent } from "../../filter.component.spec";
import { contains, eq, none } from "../../filters";

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
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
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
      MatButtonHarness.with({ text: "shared.ibFilter.clear" })
    );
    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();
    expect(component.build()).toEqual(eq("test"));
    await clear.click();
    expect(component.build()).toEqual(none());
    expect(component.searchCriteria.value).toEqual(contains("") as any);
  });

  it("should not apply filter if invalid", async () => {
    component.searchCriteria.setValue({
      operator: null,
      value: null,
    });
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();

    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();
    const spyBuild = spyOn(component, "build");
    expect(spyBuild).not.toHaveBeenCalled();
  });
});

@Component({
  template: `
    <ib-filter>
      <ib-text-filter name="sku"></ib-text-filter>
    </ib-filter>
  `
})
class IbTextFilterApp {
}
