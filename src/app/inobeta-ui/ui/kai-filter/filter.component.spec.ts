import { CommonModule } from "@angular/common";
import { Component, Type, ChangeDetectionStrategy } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { IbFilter } from "./filter.component";
import { IbFilterModule } from "./filters.module";
import { IbFilterOperator } from "./filter.types";
import { contains } from "./filters";

describe("IbFilter", () => {
  it("should create", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it("should reset", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.debugElement.query(
      By.directive(IbFilter)
    ).componentInstance;
    const textFilter = contains("123");
    component.form.patchValue({ sku: textFilter });
    component.update();
    expect(component.selectedCriteria["sku"]).toEqual(textFilter);
    component.reset();
    expect(component.selectedCriteria["sku"]).toEqual(contains(null));
  });

  it("should not update with falsey values", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.debugElement.query(
      By.directive(IbFilter)
    ).componentInstance;
    component.value = null;
    const updateSpy = spyOn(component, "update");
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it("should hydrate raw values silently without emitting events", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.debugElement.query(
      By.directive(IbFilter)
    ).componentInstance;
    const filterUpdatedSpy = jasmine.createSpy("ibFilterUpdated");
    const queryUpdatedSpy = jasmine.createSpy("ibQueryUpdated");
    component.ibFilterUpdated.subscribe(filterUpdatedSpy);
    component.ibQueryUpdated.subscribe(queryUpdatedSpy);
    const textFilter = contains("hydratedValue");
    component.hydrateRawValue({ sku: textFilter });
    expect(component.selectedCriteria["sku"]).toEqual(textFilter);
    expect(filterUpdatedSpy).not.toHaveBeenCalled();
    expect(queryUpdatedSpy).not.toHaveBeenCalled();
  });

  it("should not emit form valueChanges while recomputing value and query during hydration", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.debugElement.query(
      By.directive(IbFilter)
    ).componentInstance;
    const valueChangesSpy = jasmine.createSpy("valueChanges");
    const filterUpdatedSpy = jasmine.createSpy("ibFilterUpdated");
    const queryUpdatedSpy = jasmine.createSpy("ibQueryUpdated");
    const valueChangesSubscription = component.form.valueChanges.subscribe(valueChangesSpy);
    component.ibFilterUpdated.subscribe(filterUpdatedSpy);
    component.ibQueryUpdated.subscribe(queryUpdatedSpy);

    component.hydrateRawValue({ sku: contains("hydratedValue") });

    expect(valueChangesSpy).not.toHaveBeenCalled();
    expect(filterUpdatedSpy).not.toHaveBeenCalled();
    expect(queryUpdatedSpy).not.toHaveBeenCalled();
    expect(component.value["sku"]).toEqual(contains("hydratedValue"));
    expect(component.query["sku"]).toEqual({
      regex: ".*hydratedValue.*",
      like: "%hydratedValue%",
      condition: IbFilterOperator.CONTAINS,
      text: "hydratedValue",
    });
    valueChangesSubscription.unsubscribe();
  });

  it("should clear raw values silently with null", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.debugElement.query(
      By.directive(IbFilter)
    ).componentInstance;
    const textFilter = contains("testValue");
    component.form.patchValue({ sku: textFilter });
    component.update();
    expect(component.selectedCriteria["sku"]).toEqual(textFilter);
    const filterUpdatedSpy = jasmine.createSpy("ibFilterUpdated");
    const queryUpdatedSpy = jasmine.createSpy("ibQueryUpdated");
    component.ibFilterUpdated.subscribe(filterUpdatedSpy);
    component.ibQueryUpdated.subscribe(queryUpdatedSpy);
    component.hydrateRawValue(null);
    const rawValue = component.selectedCriteria["sku"];
    expect(rawValue).toBeDefined();
    expect(rawValue?.value).toEqual(null);
    expect(component.value).toEqual({});
    expect(filterUpdatedSpy).not.toHaveBeenCalled();
    expect(queryUpdatedSpy).not.toHaveBeenCalled();
  });

  it("should still emit events on interactive update after hydration", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.debugElement.query(
      By.directive(IbFilter)
    ).componentInstance;
    component.hydrateRawValue({ sku: contains("silent") });
    const filterUpdatedSpy = jasmine.createSpy("ibFilterUpdated");
    const queryUpdatedSpy = jasmine.createSpy("ibQueryUpdated");
    component.ibFilterUpdated.subscribe(filterUpdatedSpy);
    component.ibQueryUpdated.subscribe(queryUpdatedSpy);
    component.update();
    expect(filterUpdatedSpy).toHaveBeenCalledTimes(1);
    expect(queryUpdatedSpy).toHaveBeenCalledTimes(1);
  });
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [
      CommonModule,
      BrowserAnimationsModule,
      IbFilterModule,
      TranslateModule.forRoot({
        extend: true,
      }),
    ],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

export const createFilterComponent = createComponent;

@Component({
    template: `
    <ib-filter>
      <ib-search-bar></ib-search-bar>
      <ib-text-filter name="sku">SKU</ib-text-filter>
    </ib-filter>
  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
class IbFilterApp {}
