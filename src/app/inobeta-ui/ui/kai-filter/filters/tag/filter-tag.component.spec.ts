import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { By } from "@angular/platform-browser";
import { IbApplyFilterButton } from "../../filter-actions/apply-filter-button.component";
import { createFilterComponent } from "../../filter.component.spec";
import { eq, none, or } from "../../filters";
import { IbTagFilter } from "./filter-tag.component";
import { MatSelectionListHarness } from "@angular/material/list/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

fdescribe("IbTagFilter", () => {
  let fixture;
  let component: IbTagFilter;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = createFilterComponent(IbTagFilterApp);
    component = fixture.debugElement.query(
      By.directive(IbTagFilter)
    ).componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should build a noop filter if empty", () => {
    const filter = component.build();
    expect(filter).toEqual(none());
  });

  it("should build a filter", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const list = await menu.getHarness(MatSelectionListHarness);
    await list.selectItems({ title: /white|black/ });
    const apply = await (await menu.getChildLoader('ib-apply-filter-button')).getHarness(MatButtonHarness);
    await apply.click()
    expect(component.build()).toEqual(or([eq("black"), eq("white")]));
  });

  it("should reset with empty selection", () => {
    component.searchCriteria.setValue(["blue"]);
    component.applyFilter()
    expect(component.searchCriteria.value).toBeFalsy();
  })
});

@Component({
  template: `
    <ib-filter>
      <ib-tag-filter name="colour" [options]="options"></ib-tag-filter>
    </ib-filter>
  `,
})
class IbTagFilterApp {
  options = ["blue", "white", "pink", "black"];
}
