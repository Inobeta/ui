import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatRadioModule } from "@angular/material/radio";
import { MatRadioButtonHarness } from "@angular/material/radio/testing";
import { MatSelectModule } from "@angular/material/select";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { TranslateModule } from "@ngx-translate/core";
import {
  IbTableDataExportDialog,
  IbTableDataExportDialogData,
} from "./table-data-export-dialog.component";

describe("IbTableDataExportDialog", () => {
  let dialogData: IbTableDataExportDialogData;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IbTableDataExportDialog],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatRadioModule,
        MatSelectModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: MAT_DIALOG_DATA, useFactory: () => dialogData }],
    }).compileComponents();
  }));

  it("renders the current-page radio when enabled", async () => {
    const fixture = createDialog({ showCurrentPageOption: true });

    expect(await radioLabels(fixture)).toContain(
      "shared.ibTable.exportData.currentPage"
    );
  });

  it("does not render the current-page radio when disabled", async () => {
    const fixture = createDialog({ showCurrentPageOption: false });

    expect(await radioLabels(fixture)).not.toContain(
      "shared.ibTable.exportData.currentPage"
    );
  });

  it("shows current page by default when the option flag is omitted", async () => {
    const fixture = createDialog({});

    expect(await radioLabels(fixture)).toContain(
      "shared.ibTable.exportData.currentPage"
    );
    expect(fixture.componentInstance.settings.dataset).toBe("current");
  });

  it("initializes all-enabled configuration with all rows", () => {
    const fixture = createDialog({
      showAllRowsOption: true,
      showSelectedRowsOption: true,
      showCurrentPageOption: true,
    });

    expect(fixture.componentInstance.settings.dataset).toBe("all");
  });

  it("initializes selected-only configuration with selected rows", () => {
    const fixture = createDialog({
      showAllRowsOption: false,
      showSelectedRowsOption: true,
      showCurrentPageOption: false,
    });

    expect(fixture.componentInstance.settings.dataset).toBe("selected");
  });

  it("initializes current-only configuration with current page", () => {
    const fixture = createDialog({
      showAllRowsOption: false,
      showSelectedRowsOption: false,
      showCurrentPageOption: true,
    });

    expect(fixture.componentInstance.settings.dataset).toBe("current");
  });

  it("does not select or export a hidden dataset when all options are disabled", async () => {
    const fixture = createDialog({ showCurrentPageOption: false });
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const exportButton = await loader.getHarness(
      MatButtonHarness.with({ text: "shared.ibTable.export" })
    );

    expect(await radioLabels(fixture)).toEqual([]);
    expect(fixture.componentInstance.settings.dataset).toBeNull();
    expect(await exportButton.isDisabled()).toBeTrue();
  });

  function createDialog(
    options: Partial<IbTableDataExportDialogData>
  ): ComponentFixture<IbTableDataExportDialog> {
    dialogData = {
      showAllRowsOption: false,
      showSelectedRowsOption: false,
      formats: [{ value: "xlsx", label: "XLSX" }],
      ...options,
    };
    const fixture = TestBed.createComponent(IbTableDataExportDialog);
    fixture.detectChanges();
    return fixture;
  }

  async function radioLabels(
    fixture: ComponentFixture<IbTableDataExportDialog>
  ): Promise<string[]> {
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const radios = await loader.getAllHarnesses(MatRadioButtonHarness);
    return Promise.all(radios.map((radio) => radio.getLabelText()));
  }
});
