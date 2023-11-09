import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatSelectionListHarness } from "@angular/material/list/testing";
import { MatMenuHarness } from "@angular/material/menu/testing";
import { By } from "@angular/platform-browser";
import { createFilterComponent } from "../../filter.component.spec";
import { eq, none, or } from "../../filters";
import { IbTagFilter } from "./filter-tag.component";

describe("IbTagFilter", () => {
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

    const clear = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.clear" })
    );
    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();

    expect(component.build()).toEqual(or([eq("black"), eq("white")]));

    await clear.click();
  });

  it("should reset with empty selection", () => {
    component.searchCriteria.setValue(["blue"]);
    component.applyFilter();
    expect(component.build()).toEqual(none());
  });

  it("should reset on clear", async () => {
    const menu = await loader.getHarness(MatMenuHarness);
    await menu.open();
    const list = await menu.getHarness(MatSelectionListHarness);
    await list.selectItems({ title: /white|black/ });

    const clear = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.clear" })
    );
    const apply = await menu.getHarness(
      MatButtonHarness.with({ text: "shared.ibFilter.update" })
    );
    await apply.click();

    expect(component.build()).toEqual(or([eq("black"), eq("white")]));

    await menu.open();
    await clear.click();

    expect(component.build()).toEqual(none());
  });
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
