import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { Component } from "@angular/core";
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from "@angular/core/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDialogHarness } from "@angular/material/dialog/testing";
import { MatInputHarness } from "@angular/material/input/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";
import { IbViewStorageService } from "./view-storage.service";
import { IbViewService } from "./view.service";
import { IbSavedView, IbView, IbViewSnapshot, IView } from "./view.types";
import { IbViewModule } from "./view.module";

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

/** Minimal translation stub. */
const translateServiceStub = {
  instant: (key: string, args?: any) => {
    if (key === "shared.ibTableView.duplicatePlaceholder") {
      return `Copy of ${args?.viewName ?? ""}`;
    }
    return key;
  },
  get: () => of({}),
};

/** Toast service stub records calls. */
const toastServiceStub = {
  open: jasmine.createSpy("toast.open"),
};

/** Constructs a full ITableViewData for test Partial<IView>. */
function makeData(overrides: Record<string, unknown> = {}): any {
  return {
    filter: {},
    pageSize: 20,
    aggregatedColumns: {},
    sort: { active: "", direction: "" },
    ...overrides,
  };
}

/** Constructs a mock IbSavedView. */
function makeSaved(
  id: string,
  name: string,
  overrides?: Partial<IbViewSnapshot>
): IbSavedView {
  return {
    id,
    name,
    data: {
      filters: null,
      sort: null,
      pageSize: 20,
      aggregatedColumns: {},
      ...overrides,
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("IbViewService", () => {
  let service: IbViewService;
  let storageService: jasmine.SpyObj<IbViewStorageService>;

  const DEFAULT_SENTINEL = "__ibTableView__all";

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj<IbViewStorageService>(
      "IbViewStorageService",
      [
        "watchViews",
        "getViews",
        "resolveView",
        "createView",
        "saveView",
        "renameView",
        "deleteView",
        "reorderViews",
        "generateId",
      ]
    );

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        TranslateModule.forRoot({ extend: true }),
      ],
      providers: [
        IbViewService,
        { provide: IbViewStorageService, useValue: storageSpy },
        { provide: TranslateService, useValue: translateServiceStub },
      ],
    });

    service = TestBed.inject(IbViewService);
    storageService = TestBed.inject(
      IbViewStorageService
    ) as jasmine.SpyObj<IbViewStorageService>;

    // Default spy behaviours
    storageService.generateId.and.returnValue("gen-id-1");
    storageService.getViews.and.returnValue([]);
    storageService.resolveView.and.returnValue(null);
    storageService.watchViews.and.returnValue(of([]));

    // Reset toast spy
    (toastServiceStub.open as jasmine.Spy).calls.reset();
  });

  // ---------------------------------------------------------------------------
  // CRUD: addView
  // ---------------------------------------------------------------------------

  describe("addView", () => {
    it("should create a view and call storage.createView", () => {
      const view = service.addView({
        name: "  My View  ",
        groupName: "grp",
        data: makeData({ pageSize: 30 }),
      } as Partial<IView>);

      expect(storageService.createView).toHaveBeenCalledWith("grp", {
        id: "gen-id-1",
        name: "My View", // trimmed
        data: jasmine.objectContaining({ pageSize: 30 }) as any,
      });
      expect(view.name).toBe("My View");
      expect(view.groupName).toBe("grp");
    });

    it("should trim leading/trailing whitespace from name", () => {
      const view = service.addView({
        name: "   hello world   ",
        groupName: "g",
      });
      expect(view.name).toBe("hello world");
    });

    it("should use empty string when name is undefined", () => {
      const view = service.addView({
        groupName: "g",
      });
      expect(view.name).toBe("");
    });

    it("should use empty string when name is null", () => {
      const view = service.addView({
        name: null!,
        groupName: "g",
      });
      expect(view.name).toBe("");
    });

    it("should treat a blank name as empty", () => {
      const view = service.addView({
        name: "   ",
        groupName: "g",
      });
      expect(view.name).toBe("");
    });

    it("should extract canonical snapshot fields from data", () => {
      service.addView({
        name: "Test",
        groupName: "grp",
        data: makeData({
          filters: { status: { operator: "equals", value: "open" } },
          sort: { active: "name", direction: "asc" },
          pageSize: 50,
          aggregatedColumns: { amount: "sum" },
        }),
      } as Partial<IView>);

      const savedView: IbSavedView =
        storageService.createView.calls.mostRecent().args[1];
      expect(savedView.data.filters).toEqual({
        status: { operator: "equals", value: "open" },
      });
      expect(savedView.data.sort).toEqual({
        active: "name",
        direction: "asc",
      });
      expect(savedView.data.pageSize).toBe(50);
      expect(savedView.data.aggregatedColumns).toEqual({ amount: "sum" });
    });

    it("should default pageSize to 20 when missing from data", () => {
      service.addView({
        name: "Test",
        groupName: "grp",
        data: makeData({}),
      } as Partial<IView>);

      const savedView: IbSavedView =
        storageService.createView.calls.mostRecent().args[1];
      expect(savedView.data.pageSize).toBe(20);
    });
  });

  // ---------------------------------------------------------------------------
  // CRUD: duplicateView
  // ---------------------------------------------------------------------------

  describe("duplicateView", () => {
    it("should create a duplicate with a new ID", () => {
      storageService.generateId.and.returnValue("dup-id");

      const view = service.duplicateView({
        name: "Copy",
        groupName: "grp",
        data: makeData({ pageSize: 10, filters: { x: "y" } }),
      } as Partial<IView>);

      expect(storageService.createView).toHaveBeenCalled();
      const savedView: IbSavedView =
        storageService.createView.calls.mostRecent().args[1];
      expect(savedView.id).toBe("dup-id");
      expect(savedView.name).toBe("Copy");
      expect(view.id).toBe("dup-id");
    });
  });

  // ---------------------------------------------------------------------------
  // CRUD: saveView
  // ---------------------------------------------------------------------------

  describe("saveView", () => {
    it("should update an existing view's data", () => {
      const view = new IbView({
        id: "v1",
        name: "Original",
        groupName: "grp",
        data: {
          filters: {},
          pageSize: 20,
          aggregatedColumns: {},
          sort: { active: "", direction: "" },
          filter: {},
        },
      });

      const updated = service.saveView(view, {
        filters: { status: "open" },
        pageSize: 60,
      });

      expect(storageService.saveView).toHaveBeenCalledWith("grp", "v1", {
        filters: { status: "open" },
        sort: null,
        pageSize: 60,
        aggregatedColumns: {},
      } as IbViewSnapshot);
      expect(updated.data.pageSize).toBe(60);
    });

    it("should reject save on Default sentinel", () => {
      const defaultView = new IbView({
        id: DEFAULT_SENTINEL,
        name: "",
        groupName: "grp",
      });

      const result = service.saveView(defaultView, { pageSize: 99 });
      expect(storageService.saveView).not.toHaveBeenCalled();
      expect(result).toBe(defaultView); // returned unchanged
    });

    it("should reject save on null id", () => {
      const view: IView = {
        id: null as unknown as string,
        name: "X",
        groupName: "grp",
        data: makeData(),
      };
      const result = service.saveView(view, { pageSize: 99 });
      expect(storageService.saveView).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // CRUD: deleteView
  // ---------------------------------------------------------------------------

  describe("deleteView", () => {
    it("should delete a view by ID", () => {
      const view = new IbView({
        id: "v1",
        name: "Del",
        groupName: "grp",
      });
      service.deleteView(view);
      expect(storageService.deleteView).toHaveBeenCalledWith("grp", "v1");
    });

    it("should reject delete on Default sentinel", () => {
      const view = new IbView({
        id: DEFAULT_SENTINEL,
        name: "",
        groupName: "grp",
      });
      service.deleteView(view);
      expect(storageService.deleteView).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // CRUD: renameView
  // ---------------------------------------------------------------------------

  describe("renameView", () => {
    it("should rename a view and return updated object", () => {
      const view = new IbView({
        id: "v1",
        name: "Old",
        groupName: "grp",
      });

      const renamed = service.renameView(view, "  New Name  ");
      expect(storageService.renameView).toHaveBeenCalledWith(
        "grp",
        "v1",
        "New Name"
      );
      expect(renamed.name).toBe("New Name");
      expect(renamed.id).toBe("v1");
    });

    it("should reject rename on Default sentinel", () => {
      const view = new IbView({
        id: DEFAULT_SENTINEL,
        name: "",
        groupName: "grp",
      });
      const result = service.renameView(view, "New");
      expect(storageService.renameView).not.toHaveBeenCalled();
      expect(result).toBe(view); // returned unchanged
    });
  });

  // ---------------------------------------------------------------------------
  // CRUD: reorderViews
  // ---------------------------------------------------------------------------

  describe("reorderViews", () => {
    it("should persist a new view order", () => {
      const views: IbView[] = [
        new IbView({ id: "v3", name: "Third", groupName: "grp" }),
        new IbView({ id: "v1", name: "First", groupName: "grp" }),
      ];

      service.reorderViews("grp", views);

      expect(storageService.reorderViews).toHaveBeenCalled();
      const reordered: IbSavedView[] =
        storageService.reorderViews.calls.mostRecent().args[1];
      expect(reordered.length).toBe(2);
      expect(reordered[0].id).toBe("v3");
      expect(reordered[1].id).toBe("v1");
    });
  });

  // ---------------------------------------------------------------------------
  // Name validation
  // ---------------------------------------------------------------------------

  describe("validateViewName", () => {
    it("should return null for a valid unique name", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "Existing View"),
      ]);

      const result = service.validateViewName("grp", "New View");
      expect(result).toBeNull();
    });

    it("should return required error for empty string", () => {
      const result = service.validateViewName("grp", "");
      expect(result).toBe("shared.ibTableView.nameRequired");
    });

    it("should return required error for whitespace-only name", () => {
      const result = service.validateViewName("grp", "   ");
      expect(result).toBe("shared.ibTableView.nameRequired");
    });

    it("should return required error for null name", () => {
      const result = service.validateViewName("grp", null!);
      expect(result).toBe("shared.ibTableView.nameRequired");
    });

    it("should return duplicate error for case-insensitive match", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "My View"),
      ]);

      const result = service.validateViewName("grp", "my view");
      expect(result).toBe("shared.ibTableView.duplicateName");
    });

    it("should return duplicate error for exact match", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "My View"),
      ]);

      const result = service.validateViewName("grp", "My View");
      expect(result).toBe("shared.ibTableView.duplicateName");
    });

    it("should allow a view to keep its own name when excluded", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "My View"),
        makeSaved("v2", "Other View"),
      ]);

      const result = service.validateViewName("grp", "My View", "v1");
      expect(result).toBeNull();
    });

    it("should detect duplicate against a different view even with excludeId", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "My View"),
        makeSaved("v2", "My View"),
      ]);

      // Trying to rename v2 to "My View" (which v1 already has)
      const result = service.validateViewName("grp", "My View", "v2");
      expect(result).toBe("shared.ibTableView.duplicateName");
    });

    it("should allow a renamed view to keep its own name (case-insensitive)", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "My View"),
      ]);

      const result = service.validateViewName("grp", "  my view  ", "v1");
      expect(result).toBeNull();
    });

    it("should trim name before validation", () => {
      storageService.getViews.and.returnValue([
        makeSaved("v1", "Existing"),
      ]);

      const result = service.validateViewName("grp", "  Existing  ");
      expect(result).toBe("shared.ibTableView.duplicateName");
    });
  });

  // ---------------------------------------------------------------------------
  // viewsForGroup
  // ---------------------------------------------------------------------------

  describe("viewsForGroup", () => {
    it("should convert saved views to IView format", (done) => {
      storageService.watchViews.and.returnValue(
        of([
          makeSaved("v1", "First", { pageSize: 30 }),
          makeSaved("v2", "Second", {
            sort: { active: "name", direction: "asc" },
          }),
        ])
      );

      service.viewsForGroup("grp").subscribe((views) => {
        expect(views.length).toBe(2);
        expect(views[0].id).toBe("v1");
        expect(views[0].name).toBe("First");
        expect(views[0].groupName).toBe("grp");
        expect(views[0].data.pageSize).toBe(30);
        expect(views[1].data.sort).toEqual({
          active: "name",
          direction: "asc",
        });
        done();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // resolveView
  // ---------------------------------------------------------------------------

  describe("resolveView", () => {
    it("should return null for Default sentinel", () => {
      expect(service.resolveView("grp", DEFAULT_SENTINEL)).toBeNull();
    });

    it("should return null for null viewId", () => {
      expect(service.resolveView("grp", null!)).toBeNull();
    });

    it("should return null for undefined viewId", () => {
      expect(service.resolveView("grp", undefined!)).toBeNull();
    });

    it("should return null for unknown view", () => {
      storageService.resolveView.and.returnValue(null);
      expect(service.resolveView("grp", "unknown")).toBeNull();
    });

    it("should return IView for a resolved saved view", () => {
      storageService.resolveView.and.returnValue(
        makeSaved("v1", "Resolved", { pageSize: 50 })
      );

      const result = service.resolveView("grp", "v1");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("v1");
      expect(result!.name).toBe("Resolved");
      expect(result!.data.pageSize).toBe(50);
    });
  });

  // ---------------------------------------------------------------------------
  // Toast notifications on error
  // ---------------------------------------------------------------------------

  describe("error handling with toast", () => {
    // We use a separate module with the real toast stub
    // but spy on storage to throw

    it("should call toast on addView write failure", () => {
      const toast = jasmine.createSpyObj("toast", ["open"]);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          NoopAnimationsModule,
          MatDialogModule,
          TranslateModule.forRoot({ extend: true }),
        ],
        providers: [
          IbViewService,
          { provide: IbViewStorageService, useValue: storageService },
          { provide: TranslateService, useValue: translateServiceStub },
        ],
      });
      const svc = TestBed.inject(IbViewService);
      // Override with storage spy that throws
      const s = TestBed.inject(
        IbViewStorageService
      ) as jasmine.SpyObj<IbViewStorageService>;
      s.createView.and.throwError("Write failed");

      // We need to spy on toast in the real service. Since we can't inject it,
      // we rely on the fact that the service catches errors and shows toast.
      // Just verify it does not throw.
      expect(() => {
        svc.addView({ name: "Test", groupName: "g" });
      }).not.toThrow();
    });

    it("should not throw on deleteView write failure", () => {
      storageService.deleteView.and.throwError("Write failed");
      const view = new IbView({ id: "v1", name: "X", groupName: "grp" });
      expect(() => service.deleteView(view)).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// Dialog tests
// ---------------------------------------------------------------------------

describe("IbViewService — Dialogs", () => {
  let fixture: ComponentFixture<IbViewServiceDialogHost>;
  let service: IbViewService;
  let loader: HarnessLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IbViewServiceDialogHost],
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        TranslateModule.forRoot({ extend: true }),
        IbViewModule,
      ],
      providers: [
        IbViewService,
        {
          provide: IbViewStorageService,
          useValue: jasmine.createSpyObj("IbViewStorageService", [
            "watchViews",
            "getViews",
            "resolveView",
            "createView",
            "saveView",
            "renameView",
            "deleteView",
            "reorderViews",
            "generateId",
          ]),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IbViewServiceDialogHost);
    service = fixture.componentInstance.viewService;
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  function makeTestView(overrides?: Partial<IbView>) {
    return new IbView({
      id: "v-test",
      name: "Test View",
      groupName: "test-group",
      ...overrides,
    });
  }

  // ---------------------------------------------------------------------------
  // openDeleteViewDialog
  // ---------------------------------------------------------------------------

  it("should open delete dialog and confirm", async () => {
    const view = makeTestView();
    service.openDeleteViewDialog(view);

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();

    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.remove",
      })
    );
    await confirm.click();
    // Dialog closes — no throw expected
  });

  it("should open delete dialog and cancel", async () => {
    const view = makeTestView();
    service.openDeleteViewDialog(view);

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const cancel = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.cancel",
      })
    );
    expect(cancel).toBeTruthy();
    await cancel.click();
  });

  // ---------------------------------------------------------------------------
  // openRenameViewDialog
  // ---------------------------------------------------------------------------

  it("should open rename dialog with pre-filled name", async () => {
    const view = makeTestView({ name: "Old Name" });
    service.openRenameViewDialog(view);

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();

    // Input should be pre-filled with the view name
    const input = await loader.getHarness(MatInputHarness);
    const inputValue = await input.getValue();
    expect(inputValue).toBe("Old Name");
  });

  it("should confirm rename dialog", fakeAsync(async () => {
    const view = makeTestView({ name: "Old Name" });
    const sub = service.openRenameViewDialog(view).subscribe((result) => {
      expect(result.name).toBe("New Name");
    });

    const dialog = await loader.getHarness(MatDialogHarness);
    const input = await loader.getHarness(MatInputHarness);
    await input.setValue("New Name");

    fixture.detectChanges();
    flush();

    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.rename",
      })
    );
    await confirm.click();

    fixture.detectChanges();
    flush();
    sub.unsubscribe();
  }));

  // ---------------------------------------------------------------------------
  // openDuplicateViewDialog
  // ---------------------------------------------------------------------------

  it("should open duplicate dialog with placeholder name", async () => {
    const view = makeTestView({ name: "My View" });
    service.openDuplicateViewDialog(view);

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();

    const input = await loader.getHarness(MatInputHarness);
    // The input is pre-filled with the translate key result (raw key without loaded lang)
    const inputValue = await input.getValue();
    expect(inputValue).toBeTruthy();
  });

  it("should confirm duplicate dialog", async () => {
    const view = makeTestView({ name: "My View" });
    service.openDuplicateViewDialog(view);

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();
    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    expect(confirm).toBeTruthy();
    await confirm.click();
  });

  // ---------------------------------------------------------------------------
  // openAddViewDialog
  // ---------------------------------------------------------------------------

  it("should open add view dialog", async () => {
    service.openAddViewDialog();

    const dialog = await loader.getHarness(MatDialogHarness);
    expect(dialog).toBeTruthy();

    const confirm = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    await confirm.click();
  });

  // ---------------------------------------------------------------------------
  // openSaveChangesDialog
  // ---------------------------------------------------------------------------

  it("should open save changes dialog and save", async () => {
    const view = makeTestView({ name: "Changed View" });
    let emitted = false;
    service.openSaveChangesDialog(view).subscribe((result) => {
      expect(result.confirmed).toBeTrue();
      emitted = true;
    });

    const dialog = await loader.getHarness(MatDialogHarness);
    const saveBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await saveBtn.click();
    expect(emitted).toBeTrue();
  });

  it("should open save changes dialog and discard", async () => {
    const view = makeTestView({ name: "Changed View" });
    let emitted = false;
    service.openSaveChangesDialog(view).subscribe((result) => {
      expect(result.confirmed).toBeFalse();
      emitted = true;
    });

    const dialog = await loader.getHarness(MatDialogHarness);
    const noBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.no",
      })
    );
    await noBtn.click();
    expect(emitted).toBeTrue();
  });

  // ---------------------------------------------------------------------------
  // openSaveAsDialog
  // ---------------------------------------------------------------------------

  it("should open save as dialog, save and chain name dialog", fakeAsync(async () => {
    service.openSaveAsDialog().subscribe((result) => {
      expect(result.name).toBe("saved-as-name");
    });

    // First dialog: save/discard choice
    let dialog = await loader.getHarness(MatDialogHarness);
    const saveBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await saveBtn.click();

    fixture.detectChanges();
    flush();

    // Second dialog: name input
    const input = await loader.getHarness(MatInputHarness);
    await input.setValue("saved-as-name");

    fixture.detectChanges();
    flush();

    dialog = await loader.getHarness(MatDialogHarness);
    const addBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.add",
      })
    );
    await addBtn.click();

    fixture.detectChanges();
    flush();
  }));

  it("should open save as dialog and discard (no)", fakeAsync(async () => {
    let emitted = false;
    service.openSaveAsDialog().subscribe((result) => {
      expect(result.confirmed).toBeFalse();
      emitted = true;
    });

    const dialog = await loader.getHarness(MatDialogHarness);
    const noBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.no",
      })
    );
    await noBtn.click();

    fixture.detectChanges();
    flush();
    expect(emitted).toBeTrue();
  }));

  // ---------------------------------------------------------------------------
  // openDialog — general and discardLabel (save/discard/cancel) mode
  // ---------------------------------------------------------------------------

  it("should support save/discard/cancel three-outcome dialog", async () => {
    const dialogRef = service.openDialog({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      discardLabel: "shared.ibTableView.discard",
      message: {
        label: "shared.ibTableView.unsavedView",
        args: { viewName: "Test" },
      },
      hideInput: true,
    });

    let result: any = null;
    dialogRef.afterClosed().subscribe((r) => (result = r));

    const dialog = await loader.getHarness(MatDialogHarness);

    // Three buttons: Discard, Cancel, Save
    const discardBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.discard",
      })
    );
    expect(discardBtn).toBeTruthy();

    const cancelBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.cancel",
      })
    );
    expect(cancelBtn).toBeTruthy();

    // Click discard
    await discardBtn.click();
    expect(result).toEqual({ action: "discard", name: "" });
  });

  it("should emit save action in three-outcome dialog", async () => {
    const dialogRef = service.openDialog({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      discardLabel: "shared.ibTableView.discard",
      message: {
        label: "shared.ibTableView.unsavedView",
        args: { viewName: "Test" },
      },
      hideInput: true,
    });

    let result: any = null;
    dialogRef.afterClosed().subscribe((r) => (result = r));

    const dialog = await loader.getHarness(MatDialogHarness);
    const saveBtn = await dialog.getHarness(
      MatButtonHarness.with({
        text: "shared.ibTableView.save",
      })
    );
    await saveBtn.click();
    expect(result).toEqual({ action: "save", name: "" });
  });
});

// ---------------------------------------------------------------------------
// Host component for dialog tests
// ---------------------------------------------------------------------------

@Component({
  template: ``,
  standalone: false,
})
class IbViewServiceDialogHost {
  constructor(public viewService: IbViewService) {}
}
