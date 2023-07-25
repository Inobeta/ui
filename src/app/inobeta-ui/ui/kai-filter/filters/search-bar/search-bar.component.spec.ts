import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";
import { createFilterComponent } from "../../filter.component.spec";
import { contains, none } from "../../filters";
import { IbSearchBar } from "./search-bar.component";

fdescribe("IbSearchBar", () => {
  let fixture;
  let component: IbSearchBar;

  beforeEach(() => {
    fixture = createFilterComponent(IbFilterSearchBarApp);
    component = fixture.debugElement.query(
      By.directive(IbSearchBar)
    ).componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should clear", () => {
    expect(component.searchCriteria.value).toBeFalsy();
    component.searchCriteria.setValue("test");
    expect(component.searchCriteria.value).toBeTruthy();
    component.clear();
    expect(component.searchCriteria.value).toBeFalsy();
  });

  it("should build a noop filter if empty", () => {
    const filter = component.build();
    expect(filter).toEqual(none());
  });

  it("should build a filter", () => {
    const criteria = "hello";
    component.searchCriteria.setValue(criteria);
    const filter = component.build();
    expect(filter).toEqual(contains(criteria));
  });
});

@Component({
  template: `
    <ib-filter>
      <ib-search-bar></ib-search-bar>
    </ib-filter>
  `,
})
class IbFilterSearchBarApp {}
