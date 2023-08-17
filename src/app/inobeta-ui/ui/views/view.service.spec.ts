import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { ComponentFixture, fakeAsync, flush } from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { createViewComponent } from "./components/table-view-group/table-view-group.component.spec";
import { IbView } from "./store/views/table-view";
import { IbViewService } from "./view.service";
import { of } from "rxjs";
import { MatInputHarness } from "@angular/material/input/testing";

describe("IbViewService", () => {
  let fixture: ComponentFixture<IbViewServiceApp>;
  let service: IbViewService;
  let loader: HarnessLoader;
  let view;

  beforeEach(() => {
    fixture = createViewComponent(IbViewServiceApp);
    service = fixture.componentInstance.viewService;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    view = new IbView({
      name: "Lorem Dim Sum",
      groupName: "food",
    });
  });

  it("should open delete dialog", async () => {
    service.openDeleteViewDialog(view);
    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.remove",
      })
    );
    await confirm.click();
  });

  it("should open rename dialog", async () => {
    service.openRenameViewDialog(view);
    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
  });

  it("should open duplicate dialog", async () => {
    service.openDuplicateViewDialog(view);
    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    await confirm.click();
  });

  it("should open save as dialog, and save", fakeAsync(async () => {
    service.openSaveAsDialog().subscribe((result) => {
      expect(result?.name).toBe("test123");
    });
    let dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const save = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await save.click();

    fixture.detectChanges();
    flush();

    const input = await loader.getHarness(MatInputHarness);
    await input.setValue("test123");
    dialog = await loader.getHarness(MatDialogHarness);
    const add = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    await add.click();

    fixture.detectChanges();
    flush();
  }));

  it("should open save as dialog, and cancel", fakeAsync(async () => {
    service.openSaveAsDialog().subscribe((result) => {
      expect(result?.confirmed).toBe(false);
    });
    let dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const noButton = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ui.modalMessage.no",
      })
    );
    await noButton.click();

    fixture.detectChanges();
    flush();
  }));

  it("should open save changes dialog", async () => {
    service.openSaveChangesDialog(view).subscribe((result) => {});
    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const save = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await save.click();
  });
});

@Component({
  template: ``,
})
class IbViewServiceApp {
  constructor(public viewService: IbViewService) {}
}
