import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { createViewComponent } from "./components/table-view-group/table-view-group.component.spec";
import { IbView } from "./store/views/table-view";
import { IbViewService } from "./view.service";

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
    service.openDuplicateViewDialog(view)
    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    await confirm.click();
  });

  it("should open save as dialog", async () => {
    service.openSaveAsDialog();
    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const save = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await save.click();
  });

  it("should open save changes dialog", async () => {
    service.openSaveChangesDialog(view);
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
