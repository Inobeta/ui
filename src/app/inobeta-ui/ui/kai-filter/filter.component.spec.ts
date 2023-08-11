import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { IbFilter } from "./filter.component";
import { IbFilterModule } from "./filters.module";
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
    expect(component.rawFilter["sku"]).toEqual(textFilter);
    component.reset();
    expect(component.rawFilter["sku"]).toEqual(contains(""));
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
})
class IbFilterApp {}
