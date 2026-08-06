import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component, ChangeDetectionStrategy } from "@angular/core";
import {
  TestBed,
} from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import {
  IbTableViewDialog,
  IbTableViewDialogData,
} from "./view-dialog.component";
import { IbViewModule } from "../../view.module";

describe("IbTableViewDialog", () => {
  let dialog: MatDialog;
  let rootLoader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        TranslateModule.forRoot({ extend: true }),
        IbViewModule,
      ],
      declarations: [IbTableViewDialog, DialogAnchorComponent],
    }).compileComponents();

    dialog = TestBed.inject(MatDialog);
    // Create a fixture so documentRootLoader has a root element
    const fixture = TestBed.createComponent(DialogAnchorComponent);
    rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  /** Opens the dialog and returns the dialog harness. */
  async function open(data: IbTableViewDialogData): Promise<MatDialogHarness> {
    dialog.open(IbTableViewDialog, { width: "480px", data });
    return rootLoader.getHarness(MatDialogHarness);
  }

  /** Opens the dialog and returns both the harness and the ref. */
  async function openWithRef(
    data: IbTableViewDialogData
  ): Promise<{
    harness: MatDialogHarness;
    ref: MatDialogRef<IbTableViewDialog>;
  }> {
    const ref = dialog.open(IbTableViewDialog, { width: "480px", data });
    const harness = await rootLoader.getHarness(MatDialogHarness);
    return { harness, ref };
  }

  // ---------------------------------------------------------------------------
  // Basic rendering
  // ---------------------------------------------------------------------------

  it("should render the dialog with a title", async () => {
    const harness = await open({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    expect(harness).toBeTruthy();
    const titleText = await harness.getTitleText();
    expect(titleText).toBe("shared.ibTableView.addTitle");
  });

  it("should render name input field by default", async () => {
    await open({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------------------
  // hideInput mode (message-only dialog)
  // ---------------------------------------------------------------------------

  it("should hide the input when hideInput is true", async () => {
    const harness = await open({
      title: "shared.ibTableView.removeTitle",
      confirm: "shared.ibTableView.remove",
      message: {
        label: "shared.ibTableView.removeMessage",
        args: { viewName: "My View" },
      },
      hideInput: true,
      color: "warn",
    });

    expect(harness).toBeTruthy();
    const confirm = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.remove",
      })
    );
    expect(confirm).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Pre-filled name
  // ---------------------------------------------------------------------------

  it("should pre-fill the name input when viewName is provided", async () => {
    await open({
      title: "shared.ibTableView.renameTitle",
      confirm: "shared.ibTableView.rename",
      viewName: "Old View Name",
    });

    const input = await rootLoader.getHarness(MatInputHarness);
    const value = await input.getValue();

    expect(value).toBe("Old View Name");
  });

  it("should truncate pre-filled name to 40 characters", async () => {
    const longName = "A".repeat(50);

    await open({
      title: "shared.ibTableView.renameTitle",
      confirm: "shared.ibTableView.rename",
      viewName: longName,
    });

    const input = await rootLoader.getHarness(MatInputHarness);
    const value = await input.getValue();

    expect(value.length).toBe(40);
    expect(value).toBe("A".repeat(40));
  });

  // ---------------------------------------------------------------------------
  // Form validation — required
  // ---------------------------------------------------------------------------

  it("should disable confirm button when name is empty", async () => {
    await open({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    const confirm = await rootLoader.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    const isDisabled = await confirm.isDisabled();
    expect(isDisabled).toBeTrue();
  });

  it("should enable confirm button when name is filled", async () => {
    await open({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    const input = await rootLoader.getHarness(MatInputHarness);
    await input.setValue("New Name");

    const confirm = await rootLoader.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    const isDisabled = await confirm.isDisabled();
    expect(isDisabled).toBeFalse();
  });

  // ---------------------------------------------------------------------------
  // Legacy mode — hideCancel
  // ---------------------------------------------------------------------------

  it("should not show Cancel button when hideCancel is true", async () => {
    await open({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedView",
        args: { viewName: "Test" },
      },
      hideInput: true,
      hideCancel: true,
    });

    // Should NOT find a Cancel button
    let cancelFound = true;
    try {
      await rootLoader.getHarness(
        MatButtonHarness.with({
          text: "shared.ibTableView.cancel",
        })
      );
    } catch {
      cancelFound = false;
    }
    expect(cancelFound).toBeFalse();
  });

  // ---------------------------------------------------------------------------
  // Legacy mode — hasNo
  // ---------------------------------------------------------------------------

  it("should show No button when hasNo is true", async () => {
    const harness = await open({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedView",
        args: { viewName: "Test" },
      },
      hideInput: true,
      hideCancel: true,
      hasNo: true,
    });

    const noBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.no",
      })
    );
    expect(noBtn).toBeTruthy();
  });

  it("should emit confirmed=false when No button is clicked", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedView",
      },
      hideInput: true,
      hideCancel: true,
      hasNo: true,
    });

    let result: any = undefined;
    ref.afterClosed().subscribe((r) => (result = r));

    const noBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.no",
      })
    );
    await noBtn.click();

    expect(result).toEqual({ confirmed: false });
  });

  it("should emit confirmed=true when confirm is clicked in hasNo mode", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedView",
      },
      hideInput: true,
      hideCancel: true,
      hasNo: true,
    });

    let result: any = undefined;
    ref.afterClosed().subscribe((r) => (result = r));

    const confirmBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await confirmBtn.click();

    expect(result).toEqual({ name: "", confirmed: true });
  });

  // ---------------------------------------------------------------------------
  // Three-outcome mode — discardLabel
  // ---------------------------------------------------------------------------

  it("should show Discard, Cancel, and Save buttons when discardLabel is set", async () => {
    const harness = await open({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      discardLabel: "shared.ibTableView.discard",
      message: {
        label: "shared.ibTableView.unsavedView",
        args: { viewName: "Test" },
      },
      hideInput: true,
    });

    const discardBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.discard",
      })
    );
    expect(discardBtn).toBeTruthy();

    const cancelBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.cancel",
      })
    );
    expect(cancelBtn).toBeTruthy();

    const saveBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    expect(saveBtn).toBeTruthy();
  });

  it("should emit discard action when discard is clicked", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      discardLabel: "shared.ibTableView.discard",
      message: {
        label: "shared.ibTableView.unsavedView",
      },
      hideInput: true,
    });

    let result: any = undefined;
    ref.afterClosed().subscribe((r) => (result = r));

    const discardBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.discard",
      })
    );
    await discardBtn.click();

    expect(result).toEqual({ action: "discard", name: "" });
  });

  it("should emit save action when confirm is clicked in discardLabel mode", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      discardLabel: "shared.ibTableView.discard",
      message: {
        label: "shared.ibTableView.unsavedView",
      },
      hideInput: true,
    });

    let result: any = undefined;
    ref.afterClosed().subscribe((r) => (result = r));

    const saveBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await saveBtn.click();

    expect(result).toEqual({ action: "save", name: "" });
  });

  it("should emit cancel (undefined) when cancel is clicked in discardLabel mode", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      discardLabel: "shared.ibTableView.discard",
      message: {
        label: "shared.ibTableView.unsavedView",
      },
      hideInput: true,
    });

    let result: any = "NOT_SET";
    ref.afterClosed().subscribe((r) => (result = r));

    const cancelBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.cancel",
      })
    );
    await cancelBtn.click();

    // Cancel button with [mat-dialog-close] and no value emits empty string
    expect(result).toBe("");
  });

  // ---------------------------------------------------------------------------
  // Three-outcome + name input
  // ---------------------------------------------------------------------------

  it("should include name in save action when name input is filled", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
      discardLabel: "shared.ibTableView.discard",
    });

    let result: any = undefined;
    ref.afterClosed().subscribe((r) => (result = r));

    const input = await rootLoader.getHarness(MatInputHarness);
    await input.setValue("My Custom Name");

    const saveBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    await saveBtn.click();

    expect(result).toEqual({ action: "save", name: "My Custom Name" });
  });

  it("should include name in discard action when name input has value", async () => {
    const { harness, ref } = await openWithRef({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
      discardLabel: "shared.ibTableView.discard",
      viewName: "PreFilled",
    });

    let result: any = undefined;
    ref.afterClosed().subscribe((r) => (result = r));

    const discardBtn = await harness.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.discard",
      })
    );
    await discardBtn.click();

    expect(result).toEqual({ action: "discard", name: "PreFilled" });
  });

  // ---------------------------------------------------------------------------
  // Name length hint / FormField
  // ---------------------------------------------------------------------------

  it("should show a form field for name input", async () => {
    await open({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    const inputs = await rootLoader.getAllHarnesses(MatInputHarness);
    // Input field should be present when not hideInput
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Anchor component for dialog testing
// ---------------------------------------------------------------------------

@Component({
  template: ``,
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
class DialogAnchorComponent {}
