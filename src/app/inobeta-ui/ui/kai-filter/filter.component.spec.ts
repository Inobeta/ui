import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { IbFilterModule } from "./filters.module";

describe("IbFilter", () => {
  it("should create", () => {
    const fixture = createComponent(IbFilterApp);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  })
})

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
      <ib-text-filter name="SKU"></ib-text-filter>
    </ib-filter>
  `
})
class IbFilterApp {}