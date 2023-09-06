import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TranslateModule } from "@ngx-translate/core";
import { IbDataExportModule } from "./data-export.module";
import {
  IbDataExportService,
  OVERRIDE_EXPORT_FORMATS,
} from "./data-export.service";
import { IbDataExportProvider } from "./provider";

describe("IbDataExport", () => {
  describe("with override", () => {
    let fixture: ComponentFixture<IbDataExportWithOverrideApp>;
    let service: IbDataExportService;

    beforeEach(() => {
      fixture = createComponent(IbDataExportWithOverrideApp);
      service = fixture.componentInstance.exportService;
    });

    it("should create", () => {
      expect(service).toBeTruthy();
    });

    it("should export", () => {
      const result = service.export([], "test", "ib");
      expect(result).toBeTruthy();
    });
  });

  describe("default configuration", () => {
    let fixture: ComponentFixture<IbDataExportApp>;
    let service: IbDataExportService;

    beforeEach(() => {
      fixture = createComponent(IbDataExportApp);
      service = fixture.componentInstance.exportService;
    });

    it("should create", () => {
      expect(service).toBeTruthy();
    });

    it("should export as xlsx", () => {
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "xlsx");
      expect(spy).toHaveBeenCalled();
    });

    it("should export as pdf", () => {
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "pdf");
      expect(spy).toHaveBeenCalled();
    });

    it("should export as csv", () => {
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "csv");
      expect(spy).toHaveBeenCalled();
    });

    it("should export as csv (IE 10+)", () => {
      const msSaveBlobSpy = jasmine.createSpy("msSaveBlob")
      navigator.msSaveBlob = msSaveBlobSpy;
      const spy = spyOn(service, "export").and.callThrough();
      service.export([{ test: "123" }], "test", "csv");
      expect(spy).toHaveBeenCalled();
      expect(msSaveBlobSpy).toHaveBeenCalled();
    });
  });
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [CommonModule, IbDataExportModule, TranslateModule.forRoot()],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

export const createDataExportComponent = createComponent;

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
  ],
})
class IbDataExportWithOverrideApp {
  constructor(public exportService: IbDataExportService) {}
}

@Component({
  template: ``,
})
class IbDataExportApp {
  constructor(public exportService: IbDataExportService) {}
}
