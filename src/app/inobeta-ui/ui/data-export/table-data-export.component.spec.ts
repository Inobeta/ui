import { Component } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonHarness } from "@angular/material/button/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { IbDataExportService } from "./data-export.service";
import { IbTableDataExportAction } from "./table-data-export.component";

@Component({
  template: `
    <ib-table-data-export-action
      [showAllRowsOption]="showAllRowsOption"
      [showSelectedRowsOption]="showSelectedRowsOption"
      [showCurrentPageOption]="showCurrentPageOption"
    />
  `,
  standalone: false,
})
class IbTableDataExportActionHostComponent {
  showAllRowsOption = false;
  showSelectedRowsOption = true;
  showCurrentPageOption = false;
}

describe("IbTableDataExportAction", () => {
  let fixture: ComponentFixture<IbTableDataExportActionHostComponent>;
  let exportService: jasmine.SpyObj<IbDataExportService>;

  beforeEach(waitForAsync(() => {
    exportService = jasmine.createSpyObj<IbDataExportService>(
      "IbDataExportService",
      ["openExportDialog"]
    );
    exportService.openExportDialog.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [IbTableDataExportActionHostComponent],
      imports: [
        IbTableDataExportAction,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: IbDataExportService, useValue: exportService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbTableDataExportActionHostComponent);
    fixture.detectChanges();
  });

  it("forwards all option flags when opening the export dialog", async () => {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = await loader.getHarness(MatButtonHarness);

    await button.click();

    expect(exportService.openExportDialog).toHaveBeenCalledOnceWith({
      showAllRowsOption: false,
      showSelectedRowsOption: true,
      showCurrentPageOption: false,
    });
  });
});
