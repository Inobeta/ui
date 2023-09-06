import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideMockStore } from "@ngrx/store/testing";
import { TranslateModule } from "@ngx-translate/core";
import { IbToastModule } from "../toast";
import { initialState } from "../views";
import { IbDataExportModule } from "./data-export.module";
import { IbDataExportService, OVERRIDE_EXPORT_FORMATS } from "./data-export.service";
import { IbDataExportProvider } from "./provider";

describe("IbDataExport", () => {
  let fixture: ComponentFixture<IbDataExportApp>;
  let service: IbDataExportService;
  let loader: HarnessLoader;

  beforeEach(() => {
    fixture = createComponent(IbDataExportApp);
    service = fixture.componentInstance.exportService;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it("should create", () => {
    expect(service).toBeTruthy();
  })

  it("should export", () => {
    const result = service.export([], 'test', 'ib');
    expect(result).toBeTruthy();
  })
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [
      CommonModule,
      BrowserAnimationsModule,
      IbToastModule,
      IbDataExportModule,
      TranslateModule.forRoot({
        extend: true,
      }),
    ],
    providers: [provideMockStore({ initialState })],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

class IbStubExportProvider implements IbDataExportProvider {
  format = "ib";
  label = "inobeta";
  export(data: any[], filename: string): boolean {
    return true;
  }
}

@Component({
  template: ``,
  providers: [
    IbDataExportService,
    {
      provide: OVERRIDE_EXPORT_FORMATS,
      useClass: IbStubExportProvider,
      multi: true,
    },
  ]
})
class IbDataExportApp {
  constructor(public exportService: IbDataExportService) {}
}
