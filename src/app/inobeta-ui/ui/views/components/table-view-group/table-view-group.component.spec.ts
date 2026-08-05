import { Portal } from "@angular/cdk/portal";
import { Component, Type } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { Observable, Subject, of } from "rxjs";
import { IbToastModule } from "../../../toast";
import { IbFilterOperator } from "../../../kai-filter/filter.types";
import { IbTableViewsData } from "../../../kai-table/table-views-host";
import { IView, IbViewDialogResult } from "../../view.types";
import { IbViewService } from "../../view.service";
import { IbViewStorageService } from "../../view-storage.service";
import { IbViewModule } from "../../view.module";
import { IbTableViewGroup } from "./table-view-group.component";

const DEFAULT_SENTINEL = "__ibTableView__all";

/** Constructs a minimal IView for testing. */
function makeView(overrides: Partial<IView> = {}): IView {
  return {
    id: "v-test",
    name: "Test View",
    groupName: "issues",
    data: {
      filter: {},
      filters: null,
      pageSize: 20,
      aggregatedColumns: {},
      sort: { active: "", direction: "" },
    },
    ...overrides,
  };
}

/** Default baseline matching the component's internal defaults. */
const defaultBaseline: IbTableViewsData = {
  filter: {},
  filters: null,
  pageSize: 20,
  aggregatedColumns: {},
  sort: { active: "", direction: "" },
};

describe("IbTableViewGroup", () => {
  let fixture: ComponentFixture<IbViewApp>;
  let component: IbTableViewGroup;
  let viewService: IbViewService;
  let storageService: jasmine.SpyObj<IbViewStorageService>;

  // Dialog response subjects for fine-grained control in multi-step flows
  let addViewDialog$: Subject<{ name: string }>;
  let saveDiscardCancelDialog$: Subject<{ action: string; name?: string } | null>;

  beforeEach(async () => {
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
      declarations: [IbViewApp],
      imports: [
        NoopAnimationsModule,
        IbToastModule,
        IbViewModule,
        TranslateModule.forRoot({ extend: true }),
      ],
      providers: [{ provide: IbViewStorageService, useValue: storageSpy }],
    }).compileComponents();

    storageService = TestBed.inject(
      IbViewStorageService
    ) as jasmine.SpyObj<IbViewStorageService>;

    // Default storage spy behaviours
    storageService.watchViews.and.returnValue(of([]));
    storageService.generateId.and.returnValue("gen-id-1");
    storageService.getViews.and.returnValue([]);
    storageService.resolveView.and.returnValue(null);

    fixture = TestBed.createComponent(IbViewApp);
    component = fixture.debugElement.query(
      By.directive(IbTableViewGroup)
    ).componentInstance;

    viewService = TestBed.inject(IbViewService);

    // Dialog response subjects
    addViewDialog$ = new Subject<{ name: string }>();
    saveDiscardCancelDialog$ = new Subject<{ action: string; name?: string } | null>();

    // Spy on dialog methods to control outcomes without opening real dialogs
    spyOn(viewService, "openAddViewDialog").and.callFake(() =>
      addViewDialog$.asObservable()
    );
    spyOn(viewService, "openDeleteViewDialog").and.returnValue(of(true));
    spyOn(viewService, "openRenameViewDialog").and.returnValue(
      of({ name: "Renamed View" })
    );
    spyOn(viewService, "openDuplicateViewDialog").and.returnValue(
      of({ name: "Duplicated View" })
    );
    spyOn(viewService, "openDialog").and.callFake(
      () =>
        ({
          afterClosed: () => saveDiscardCancelDialog$.asObservable(),
        } as any)
    );

    // Initialise the component with baseline and accessor
    component.setDefaultViewBaseline(defaultBaseline);
    component.setViewDataAccessor(() => ({
      filter: {},
      filters: null,
      pageSize: 20,
      aggregatedColumns: {},
      sort: { active: "", direction: "" },
    }));
    component.setViewGroupName("issues");
    fixture.detectChanges();
    await fixture.whenStable();
  });

  // ---------------------------------------------------------------------------
  // IbTableViewsHost contract — basic properties
  // ---------------------------------------------------------------------------

  describe("IbTableViewsHost contract", () => {
    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("setViewGroupName should set viewGroupName and subscribe views$", () => {
      expect(component.viewGroupName).toBe("issues");
      expect(component.views$).toBeDefined();
      expect(storageService.watchViews).toHaveBeenCalledWith("issues");
    });

    it("setViewDataAccessor should store the accessor function", () => {
      const accessor = () => ({
        filter: { color: { operator: IbFilterOperator.EQUALS, value: "red" } },
        filters: { color: { operator: IbFilterOperator.EQUALS, value: "red" } },
        pageSize: 10,
        aggregatedColumns: { amount: "sum" },
        sort: { active: "name", direction: "asc" as const },
      });
      component.setViewDataAccessor(accessor);
      fixture.detectChanges();

      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("handleStateChanges should subscribe and update dirty when data changes", async () => {
      const changes$ = new Subject<void>();
      component.handleStateChanges(changes$);
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();

      // Initially not dirty (accessor returns same as default baseline)
      expect(component.dirty).toBeFalse();

      // Change the accessor to return different data
      component.setViewDataAccessor(() => ({
        filter: { color: { operator: IbFilterOperator.EQUALS, value: "blue" } },
        filters: { color: { operator: IbFilterOperator.EQUALS, value: "blue" } },
        pageSize: 50,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      // Emit change signal
      changes$.next();
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();

      expect(component.dirty).toBeTrue();
    });

    it("toolbarPortals should return portals from action buttons", () => {
      const portals = component.toolbarPortals;
      expect(portals).toBeDefined();
      expect(Array.isArray(portals)).toBeTrue();
      expect(portals.length).toBe(2);
      portals.forEach((p) => {
        expect(p instanceof Portal).toBeTrue();
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Default view baseline
  // ---------------------------------------------------------------------------

  describe("Default view baseline", () => {
    it("defaultView should use the sentinel ID and the baseline data", () => {
      expect(component.defaultView.id).toBe(DEFAULT_SENTINEL);
      expect(component.defaultView.name).toBe("");
      expect(component.defaultView.groupName).toBe("issues");
      expect(component.defaultView.data.pageSize).toBe(20);
    });

    it("should update defaultView data when setDefaultViewBaseline is called after initialisation", () => {
      const newBaseline: IbTableViewsData = {
        filter: {},
        filters: { status: { operator: IbFilterOperator.EQUALS, value: "open" } },
        pageSize: 50,
        aggregatedColumns: { count: "avg" },
        sort: { active: "priority", direction: "desc" },
      };
      component.setDefaultViewBaseline(newBaseline);
      fixture.detectChanges();

      // defaultView should reflect the new baseline
      expect(component.defaultView.data.pageSize).toBe(50);
      expect(component.defaultView.data.sort).toEqual({
        active: "priority",
        direction: "desc",
      });
      expect(component.defaultView.data.aggregatedColumns).toEqual({
        count: "avg",
      });
    });

    it("should update activeView data when default baseline changes and Default is active", () => {
      // Active view is the Default (sentinel) initially
      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);

      const newBaseline: IbTableViewsData = {
        filter: {},
        filters: null,
        pageSize: 100,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      };
      component.setDefaultViewBaseline(newBaseline);
      fixture.detectChanges();

      expect(component.activeView.data.pageSize).toBe(100);
    });
  });

  // ---------------------------------------------------------------------------
  // Canonical synchronization (syncActiveView)
  // ---------------------------------------------------------------------------

  describe("Canonical synchronization (syncActiveView)", () => {
    it("should set active view to Default when viewId is null", () => {
      component.syncActiveView(null);
      fixture.detectChanges();

      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);
      expect(component.dirty).toBeFalse();
    });

    it("should set active view to Default when viewId is empty string", () => {
      component.syncActiveView("");
      fixture.detectChanges();

      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);
      expect(component.dirty).toBeFalse();
    });

    it("should set active view to a resolved saved view", () => {
      // Arrange — make the service resolve a view
      const savedView = makeView({
        id: "saved-1",
        name: "Saved View",
        data: {
          filter: {},
          filters: { status: { operator: IbFilterOperator.EQUALS, value: "open" } },
          pageSize: 30,
          aggregatedColumns: {},
          sort: { active: "name", direction: "asc" },
        },
      });
      spyOn(viewService, "resolveView").and.returnValue(savedView);

      component.syncActiveView("saved-1");
      fixture.detectChanges();

      expect(component.activeView.id).toBe("saved-1");
      expect(component.activeView.name).toBe("Saved View");
      // Sync uses initial:true → no activeViewChanged emission
    });

    it("should fall back to Default for an unknown view ID", () => {
      spyOn(viewService, "resolveView").and.returnValue(null);

      component.syncActiveView("unknown-id");
      fixture.detectChanges();

      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);
      expect(component.dirty).toBeFalse();
    });

    it("syncActiveView should NOT emit activeViewChanged", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      const savedView = makeView({ id: "sync-test", name: "Sync" });
      spyOn(viewService, "resolveView").and.returnValue(savedView);

      component.syncActiveView("sync-test");
      fixture.detectChanges();

      expect(emitted.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // View resolution (resolveView)
  // ---------------------------------------------------------------------------

  describe("View resolution (resolveView)", () => {
    it("should return null for null viewId", fakeAsync(async () => {
      const result = await firstValueFrom(component.resolveView(null));
      expect(result).toBeNull();
    }));

    it("should return null for the Default sentinel", fakeAsync(async () => {
      const result = await firstValueFrom(
        component.resolveView(DEFAULT_SENTINEL)
      );
      expect(result).toBeNull();
    }));

    it("should return null for an unknown view ID", fakeAsync(async () => {
      spyOn(viewService, "resolveView").and.returnValue(null);
      const result = await firstValueFrom(
        component.resolveView("unknown-id")
      );
      expect(result).toBeNull();
    }));

    it("should resolve a view by ID and return canonical data", fakeAsync(async () => {
      const savedView = makeView({
        id: "resolved-1",
        name: "Resolved",
        data: {
          filter: {},
          filters: { color: { operator: IbFilterOperator.EQUALS, value: "red" } },
          pageSize: 25,
          aggregatedColumns: { count: "sum" },
          sort: { active: "date", direction: "desc" },
        },
      });
      spyOn(viewService, "resolveView").and.returnValue(savedView);

      const result = await firstValueFrom(
        component.resolveView("resolved-1")
      );
      expect(result).not.toBeNull();
      expect(result!.pageSize).toBe(25);
      expect(result!.aggregatedColumns).toEqual({ count: "sum" });
      expect(result!.sort).toEqual({ active: "date", direction: "desc" });
      expect(result!.filters).toEqual({
        color: { operator: IbFilterOperator.EQUALS, value: "red" },
      });
    }));

    it("should be group-scoped: same ID in different group resolves independently", () => {
      // resolveView is group-scoped; the service.resolveView uses viewGroupName
      const spy = spyOn(viewService, "resolveView").and.returnValue(null);

      component.resolveView("v1");
      expect(spy).toHaveBeenCalledWith("issues", "v1");
    });
  });

  // ---------------------------------------------------------------------------
  // Dirty tracking
  // ---------------------------------------------------------------------------

  describe("Dirty tracking", () => {
    it("checkViewDataChanges should return false when data matches baseline (Default active)", () => {
      expect(component.checkViewDataChanges()).toBeFalse();
    });

    it("checkViewDataChanges should return true when data differs from baseline", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { color: { operator: IbFilterOperator.EQUALS, value: "green" } },
        pageSize: 30,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));
      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("checkViewDataChanges should return false when accessor returns undefined", () => {
      component.setViewDataAccessor(
        () => undefined as unknown as IbTableViewsData
      );
      expect(component.checkViewDataChanges()).toBeFalse();
    });

    it("checkViewDataChanges should detect sort changes", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: null,
        pageSize: 20,
        aggregatedColumns: {},
        sort: { active: "name", direction: "asc" },
      }));
      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("checkViewDataChanges should detect pageSize changes", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: null,
        pageSize: 50,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));
      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("checkViewDataChanges should detect aggregatedColumns changes", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: null,
        pageSize: 20,
        aggregatedColumns: { amount: "sum" },
        sort: { active: "", direction: "" },
      }));
      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("checkViewDataChanges should be order-insensitive for filter keys", () => {
      // Set a named view as active first
      const savedView = makeView({
        id: "v1",
        data: {
          filter: {},
          filters: {
            b: { operator: IbFilterOperator.EQUALS, value: "2" },
            a: { operator: IbFilterOperator.EQUALS, value: "1" },
          },
          pageSize: 20,
          aggregatedColumns: {},
          sort: { active: "", direction: "" },
        },
      });
      (component as any)._activeView.next(savedView);
      fixture.detectChanges();

      // Accessor returns same filters but with different key order
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: {
          a: { operator: IbFilterOperator.EQUALS, value: "1" },
          b: { operator: IbFilterOperator.EQUALS, value: "2" },
        },
        pageSize: 20,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      expect(component.checkViewDataChanges()).toBeFalse();
    });

    it("checkViewDataChanges should be order-insensitive for aggregatedColumns keys", () => {
      const savedView = makeView({
        id: "v1",
        data: {
          filter: {},
          filters: null,
          pageSize: 20,
          aggregatedColumns: { colB: "sum", colA: "avg" },
          sort: { active: "", direction: "" },
        },
      });
      (component as any)._activeView.next(savedView);
      fixture.detectChanges();

      component.setViewDataAccessor(() => ({
        filter: {},
        filters: null,
        pageSize: 20,
        aggregatedColumns: { colA: "avg", colB: "sum" },
        sort: { active: "", direction: "" },
      }));

      expect(component.checkViewDataChanges()).toBeFalse();
    });

    it("dirty should be reset when handleDiscardChanges is called", () => {
      // Make dirty
      (component as any)._dirty = true;
      expect(component.dirty).toBeTrue();

      component.handleDiscardChanges();
      fixture.detectChanges();

      expect(component.dirty).toBeFalse();
    });
  });

  // ---------------------------------------------------------------------------
  // View Add (handleAddView)
  // ---------------------------------------------------------------------------

  describe("handleAddView", () => {
    it("should open add dialog, call addView, and select the new view", () => {
      component.handleAddView();

      // Emit the dialog confirmation with a name
      addViewDialog$.next({ name: "My New View" });
      addViewDialog$.complete();

      expect(viewService.openAddViewDialog).toHaveBeenCalled();
      expect(storageService.createView).toHaveBeenCalledWith(
        "issues",
        jasmine.objectContaining({ name: "My New View" })
      );
      // The active view should be the newly created view
      expect(component.activeView.id).toBe("gen-id-1");
      expect(component.activeView.name).toBe("My New View");
    });

    it("should capture current accessor state via handleSaveView on Default", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { type: { operator: IbFilterOperator.EQUALS, value: "bug" } },
        pageSize: 30,
        aggregatedColumns: { priority: "avg" },
        sort: { active: "name", direction: "asc" },
      }));

      // handleSaveView on Default delegates to handleAddView with the accessor data
      component.handleSaveView();
      addViewDialog$.next({ name: "With Data" });
      addViewDialog$.complete();

      const savedView = storageService.createView.calls.mostRecent().args[1];
      expect(savedView.data.pageSize).toBe(30);
      expect(savedView.data.filters).toEqual({
        type: { operator: IbFilterOperator.EQUALS, value: "bug" },
      });
      expect(savedView.data.sort).toEqual({
        active: "name",
        direction: "asc",
      });
      expect(savedView.data.aggregatedColumns).toEqual({ priority: "avg" });
    });
  });

  // ---------------------------------------------------------------------------
  // View Duplicate (handleDuplicateView)
  // ---------------------------------------------------------------------------

  describe("handleDuplicateView", () => {
    it("should open duplicate dialog, create a duplicate and select it", () => {
      const view = makeView({ id: "original-1", name: "Original" });

      component.handleDuplicateView(view);

      // The dialog spy returns { name: 'Duplicated View' } by default
      expect(viewService.openDuplicateViewDialog).toHaveBeenCalledWith(view);
      expect(storageService.createView).toHaveBeenCalled();
      const savedView = storageService.createView.calls.mostRecent().args[1];
      expect(savedView.id).toBe("gen-id-1");
      // Active view should be the duplicate
      expect(component.activeView.id).toBe("gen-id-1");
    });

    it("should capture current accessor state when duplicating", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { status: { operator: IbFilterOperator.EQUALS, value: "open" } },
        pageSize: 40,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      const view = makeView({ id: "original-1", name: "Original" });
      component.handleDuplicateView(view);

      const savedView = storageService.createView.calls.mostRecent().args[1];
      expect(savedView.data.pageSize).toBe(40);
      expect(savedView.data.filters).toEqual({
        status: { operator: IbFilterOperator.EQUALS, value: "open" },
      });
    });

    it("should not duplicate the Default view (sentinel guard)", () => {
      const defaultView = makeView({ id: DEFAULT_SENTINEL, name: "" });
      component.handleDuplicateView(defaultView);

      expect(viewService.openDuplicateViewDialog).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // View Save (handleSaveView)
  // ---------------------------------------------------------------------------

  describe("handleSaveView", () => {
    it("on Default: should open name dialog and create a new view", () => {
      // Active view is Default initially
      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);

      component.handleSaveView();

      expect(viewService.openAddViewDialog).toHaveBeenCalled();

      addViewDialog$.next({ name: "Saved Default" });
      addViewDialog$.complete();

      expect(storageService.createView).toHaveBeenCalled();
      expect(component.activeView.name).toBe("Saved Default");
      expect(component.activeView.id).toBe("gen-id-1");
    });

    it("on Default: should capture current accessor state in the saved view", () => {
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { x: { operator: IbFilterOperator.EQUALS, value: "1" } },
        pageSize: 60,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      component.handleSaveView();
      addViewDialog$.next({ name: "Data View" });
      addViewDialog$.complete();

      const saved = storageService.createView.calls.mostRecent().args[1];
      expect(saved.data.pageSize).toBe(60);
      expect(saved.data.filters).toEqual({
        x: { operator: IbFilterOperator.EQUALS, value: "1" },
      });
    });

    it("on named view: should save in place and NOT emit activeViewChanged", () => {
      // Arrange: set a named view as active (simulated via initial:true for test setup)
      const namedView = makeView({
        id: "named-1",
        name: "Named View",
        data: {
          filter: {},
          filters: null,
          pageSize: 20,
          aggregatedColumns: {},
          sort: { active: "", direction: "" },
        },
      });
      (component as any)._activeView.next({ ...namedView, initial: true });
      fixture.detectChanges();

      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { status: { operator: IbFilterOperator.EQUALS, value: "done" } },
        pageSize: 40,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      component.handleSaveView();
      fixture.detectChanges();

      // Should have called saveView on the service
      expect(storageService.saveView).toHaveBeenCalledWith(
        "issues",
        "named-1",
        jasmine.objectContaining({ pageSize: 40 } as any)
      );
      // Dirty should be reset
      expect(component.dirty).toBeFalse();
      // No activeViewChanged emission (saved with initial:true)
      expect(emitted.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // View Rename (handleRenameView)
  // ---------------------------------------------------------------------------

  describe("handleRenameView", () => {
    it("should rename a view and update active view state without emitting", () => {
      const view = makeView({ id: "view-1", name: "Old Name" });
      // Make it the active view (use initial:true for test setup to avoid spurious emission)
      (component as any)._activeView.next({ ...view, initial: true });
      fixture.detectChanges();

      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.handleRenameView(view);
      fixture.detectChanges();

      expect(viewService.openRenameViewDialog).toHaveBeenCalledWith(view);
      // The rename spy returns { name: 'Renamed View' }
      expect(storageService.renameView).toHaveBeenCalledWith(
        "issues",
        "view-1",
        "Renamed View"
      );
      // Active view should be updated with new name
      expect(component.activeView.name).toBe("Renamed View");
      // No activeViewChanged emission (rename uses initial:true)
      expect(emitted.length).toBe(0);
    });

    it("should not rename the Default view (sentinel guard)", () => {
      const defaultView = makeView({ id: DEFAULT_SENTINEL, name: "" });
      component.handleRenameView(defaultView);

      expect(viewService.openRenameViewDialog).not.toHaveBeenCalled();
    });

    it("should rename a non-active view without affecting the active view", () => {
      const activeView = makeView({ id: "active-1", name: "Active" });
      const otherView = makeView({ id: "other-1", name: "Other" });
      (component as any)._activeView.next({ ...activeView, initial: true });
      fixture.detectChanges();

      component.handleRenameView(otherView);
      fixture.detectChanges();

      expect(storageService.renameView).toHaveBeenCalledWith(
        "issues",
        "other-1",
        "Renamed View"
      );
      // Active view should remain unchanged
      expect(component.activeView.id).toBe("active-1");
    });
  });

  // ---------------------------------------------------------------------------
  // View Delete (handleRemoveView)
  // ---------------------------------------------------------------------------

  describe("handleRemoveView", () => {
    it("should delete an active view and switch to Default", () => {
      const view = makeView({ id: "active-v", name: "Active" });
      (component as any)._activeView.next({ ...view, initial: true });
      fixture.detectChanges();

      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.handleRemoveView(view);
      fixture.detectChanges();

      expect(viewService.openDeleteViewDialog).toHaveBeenCalledWith(view);
      expect(storageService.deleteView).toHaveBeenCalledWith("issues", "active-v");
      // Should switch to Default
      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);
      // Should emit activeViewChanged with viewId: null (Default)
      expect(emitted.length).toBeGreaterThanOrEqual(1);
      const lastEmitted = emitted[emitted.length - 1];
      expect(lastEmitted.viewId).toBeNull();
    });

    it("should delete an inactive view without changing active view", () => {
      const activeView = makeView({ id: "active-1", name: "Active" });
      const otherView = makeView({ id: "other-1", name: "Other" });
      (component as any)._activeView.next({ ...activeView, initial: true });
      fixture.detectChanges();

      component.handleRemoveView(otherView);
      fixture.detectChanges();

      expect(storageService.deleteView).toHaveBeenCalledWith(
        "issues",
        "other-1"
      );
      // Active view should remain unchanged
      expect(component.activeView.id).toBe("active-1");
    });

    it("should not delete the Default view (sentinel guard)", () => {
      const defaultView = makeView({ id: DEFAULT_SENTINEL, name: "" });
      component.handleRemoveView(defaultView);

      expect(viewService.openDeleteViewDialog).not.toHaveBeenCalled();
      expect(storageService.deleteView).not.toHaveBeenCalled();
    });

    it("should not delete if dialog is cancelled", () => {
      // Override the delete dialog spy to simulate cancellation
      (viewService.openDeleteViewDialog as jasmine.Spy).and.returnValue(
        new Subject().asObservable()
      );

      const view = makeView({ id: "v1", name: "View" });
      component.handleRemoveView(view);

      expect(storageService.deleteView).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // View Reorder (handleReorderViews)
  // ---------------------------------------------------------------------------

  describe("handleReorderViews", () => {
    it("should persist the new view order", () => {
      const views: IView[] = [
        makeView({ id: "v3", name: "Third" }),
        makeView({ id: "v1", name: "First" }),
        makeView({ id: "v2", name: "Second" }),
      ];

      component.handleReorderViews(views);

      expect(storageService.reorderViews).toHaveBeenCalled();
      const reordered = storageService.reorderViews.calls.mostRecent().args[1];
      expect(reordered.length).toBe(3);
      expect(reordered[0].id).toBe("v3");
      expect(reordered[1].id).toBe("v1");
      expect(reordered[2].id).toBe("v2");
    });

    it("should be group-scoped", () => {
      const views: IView[] = [makeView({ id: "v1" })];
      component.handleReorderViews(views);

      expect(storageService.reorderViews).toHaveBeenCalledWith(
        "issues",
        jasmine.any(Array)
      );
    });

    it("should NOT emit activeViewChanged", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.handleReorderViews([makeView({ id: "v1" })]);

      expect(emitted.length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // View Selection (handleChangeView) — clean switch
  // ---------------------------------------------------------------------------

  describe("handleChangeView — clean switch", () => {
    it("should immediately switch to the target view when not dirty", () => {
      const targetView = makeView({ id: "target-1", name: "Target" });

      component.handleChangeView(targetView);
      fixture.detectChanges();

      expect(component.activeView.id).toBe("target-1");
      expect(component.activeView.name).toBe("Target");
    });

    it("should emit activeViewChanged on clean switch", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);
      fixture.detectChanges();

      expect(emitted.length).toBeGreaterThanOrEqual(1);
      const lastEmitted = emitted[emitted.length - 1];
      expect(lastEmitted.viewId).toBe("target-1");
    });
  });

  // ---------------------------------------------------------------------------
  // View Selection (handleChangeView) — dirty Default flows
  // ---------------------------------------------------------------------------

  describe("handleChangeView — dirty Default save/discard/cancel", () => {
    it("should save Default as new view (Save chain) and switch to target", () => {
      // Make dirty
      (component as any)._dirty = true;
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { x: { operator: IbFilterOperator.EQUALS, value: "1" } },
        pageSize: 30,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      // Step 1: save/discard/cancel dialog
      expect(viewService.openDialog).toHaveBeenCalled();
      saveDiscardCancelDialog$.next({ action: IbViewDialogResult.Save });
      saveDiscardCancelDialog$.complete();

      // Step 2: name dialog
      expect(viewService.openAddViewDialog).toHaveBeenCalled();
      addViewDialog$.next({ name: "Saved Default" });
      addViewDialog$.complete();

      // Should have created the view with current state
      expect(storageService.createView).toHaveBeenCalled();
      const saved = storageService.createView.calls.mostRecent().args[1];
      expect(saved.name).toBe("Saved Default");
      expect(saved.data.pageSize).toBe(30);

      // Should switch to target view
      expect(component.activeView.id).toBe("target-1");
    });

    it("should discard changes on Default and switch to target", () => {
      (component as any)._dirty = true;

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      saveDiscardCancelDialog$.next({ action: IbViewDialogResult.Discard });
      saveDiscardCancelDialog$.complete();

      // No save should have occurred
      expect(storageService.createView).not.toHaveBeenCalled();
      expect(storageService.saveView).not.toHaveBeenCalled();
      // Should switch to target view
      expect(component.activeView.id).toBe("target-1");
    });

    it("should cancel and stay on Default", () => {
      (component as any)._dirty = true;

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      // Cancel sends null/falsy
      saveDiscardCancelDialog$.next(null);
      saveDiscardCancelDialog$.complete();

      // No save should have occurred
      expect(storageService.createView).not.toHaveBeenCalled();
      // Should stay on Default
      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);
    });

    it("should cancel name dialog and stay on Default (Save chain cancelled)", () => {
      (component as any)._dirty = true;

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      // Step 1: Save
      saveDiscardCancelDialog$.next({ action: IbViewDialogResult.Save });
      saveDiscardCancelDialog$.complete();

      // Step 2: name dialog — cancelled (complete without emitting)
      expect(viewService.openAddViewDialog).toHaveBeenCalled();
      addViewDialog$.complete(); // No emission = cancelled

      // No view should have been created
      expect(storageService.createView).not.toHaveBeenCalled();
      // Should stay on Default
      expect(component.activeView.id).toBe(DEFAULT_SENTINEL);
    });
  });

  // ---------------------------------------------------------------------------
  // View Selection (handleChangeView) — dirty named flows
  // ---------------------------------------------------------------------------

  describe("handleChangeView — dirty named save/discard/cancel", () => {
    beforeEach(() => {
      // Set a named view as active (use initial:true for test setup)
      const activeView = makeView({
        id: "current-1",
        name: "Current View",
      });
      (component as any)._activeView.next({ ...activeView, initial: true });
      fixture.detectChanges();
    });

    it("should save current view and switch to target (dirty named → Save)", () => {
      (component as any)._dirty = true;
      component.setViewDataAccessor(() => ({
        filter: {},
        filters: { status: { operator: IbFilterOperator.EQUALS, value: "done" } },
        pageSize: 50,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      saveDiscardCancelDialog$.next({ action: IbViewDialogResult.Save });
      saveDiscardCancelDialog$.complete();

      expect(storageService.saveView).toHaveBeenCalledWith(
        "issues",
        "current-1",
        jasmine.objectContaining({ pageSize: 50 } as any)
      );
      // Should switch to target
      expect(component.activeView.id).toBe("target-1");
    });

    it("should discard changes and switch to target (dirty named → Discard)", () => {
      (component as any)._dirty = true;

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      saveDiscardCancelDialog$.next({ action: IbViewDialogResult.Discard });
      saveDiscardCancelDialog$.complete();

      expect(storageService.saveView).not.toHaveBeenCalled();
      expect(component.activeView.id).toBe("target-1");
    });

    it("should cancel and stay on current view (dirty named → Cancel)", () => {
      (component as any)._dirty = true;

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);

      saveDiscardCancelDialog$.next(null);
      saveDiscardCancelDialog$.complete();

      expect(storageService.saveView).not.toHaveBeenCalled();
      expect(component.activeView.id).toBe("current-1");
    });
  });

  // ---------------------------------------------------------------------------
  // activeViewChanged emissions — user intent only
  // ---------------------------------------------------------------------------

  describe("activeViewChanged emissions", () => {
    it("should NOT emit on initial sync (initial flag)", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      // The initial _activeView emission has initial: true
      fixture.detectChanges();

      expect(emitted.length).toBe(0);
    });

    it("should emit when explicitly selecting a view via handleChangeView", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      const targetView = makeView({ id: "target-1", name: "Target" });
      component.handleChangeView(targetView);
      fixture.detectChanges();

      expect(emitted.length).toBe(1);
      expect(emitted[0].viewId).toBe("target-1");
    });

    it("should emit viewId null when Default is selected", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      // First switch to a named view
      const namedView = makeView({ id: "named-1", name: "Named" });
      component.handleChangeView(namedView);
      fixture.detectChanges();

      // Clear previous emissions
      emitted.length = 0;

      // Switch back to Default
      component.handleChangeView(component.defaultView);
      fixture.detectChanges();

      expect(emitted.length).toBe(1);
      expect(emitted[0].viewId).toBeNull();
    });

    it("should NOT emit on save (named view)", () => {
      // Set up a named active view (use initial:true to avoid spurious emission)
      const namedView = makeView({ id: "named-1", name: "Named" });
      (component as any)._activeView.next({ ...namedView, initial: true });
      fixture.detectChanges();

      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.handleSaveView();
      fixture.detectChanges();

      expect(emitted.length).toBe(0);
    });

    it("should NOT emit on rename", () => {
      const view = makeView({ id: "named-1", name: "Named" });
      (component as any)._activeView.next({ ...view, initial: true });
      fixture.detectChanges();

      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.handleRenameView(view);
      fixture.detectChanges();

      expect(emitted.length).toBe(0);
    });

    it("should NOT emit on reorder", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.handleReorderViews([makeView({ id: "v1" })]);

      expect(emitted.length).toBe(0);
    });

    it("should NOT emit on syncActiveView (canonical hydration)", () => {
      const savedView = makeView({ id: "sync-1", name: "Sync" });
      spyOn(viewService, "resolveView").and.returnValue(savedView);

      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      component.syncActiveView("sync-1");
      fixture.detectChanges();

      expect(emitted.length).toBe(0);
    });

    it("should emit when adding a new view", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      // Emit active view change via _activeView directly (simulating addView flow)
      const newView = makeView({ id: "new-1", name: "New" });
      (component as any)._activeView.next(newView);
      fixture.detectChanges();

      // Only non-initial emissions are captured
      const nonInitial = emitted.filter((e) => e !== undefined);
      expect(nonInitial.length).toBeGreaterThanOrEqual(1);
    });

    it("should emit when the active view changes after a duplicate", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      const view = makeView({ id: "original-1", name: "Original" });
      component.handleDuplicateView(view);
      fixture.detectChanges();

      // Duplicate creates a new view and sets it as active (without initial flag)
      expect(emitted.length).toBeGreaterThanOrEqual(1);
      expect(emitted[emitted.length - 1].viewId).toBe("gen-id-1");
    });
  });

  // ---------------------------------------------------------------------------
  // Group-scoped resolution
  // ---------------------------------------------------------------------------

  describe("Group-scoped operations", () => {
    it("resolveView should use the correct group name", () => {
      const spy = spyOn(viewService, "resolveView").and.returnValue(null);

      component.resolveView("v1");

      expect(spy).toHaveBeenCalledWith("issues", "v1");
    });

    it("views$ should watch the correct group", () => {
      // setViewGroupName was already called in beforeEach with "issues"
      expect(storageService.watchViews).toHaveBeenCalledWith("issues");
    });

    it("setViewGroupName for a different group should update the group-scoped stream", () => {
      storageService.watchViews.calls.reset();
      component.setViewGroupName("another-table");
      fixture.detectChanges();

      expect(storageService.watchViews).toHaveBeenCalledWith("another-table");
      expect(component.viewGroupName).toBe("another-table");
    });
  });

  // ---------------------------------------------------------------------------
  // Standalone — firstValueFrom helper
  // ---------------------------------------------------------------------------
});

/** Helper: extracts first value from an Observable. */
function firstValueFrom<T>(obs: Observable<T>): Promise<T> {
  return new Promise((resolve) => {
    const sub = obs.subscribe((val) => {
      resolve(val);
      setTimeout(() => sub.unsubscribe(), 0);
    });
  });
}

// ---------------------------------------------------------------------------
// Host component
// ---------------------------------------------------------------------------

@Component({
  template: ` <ib-view-group></ib-view-group> `,
  standalone: false,
})
class IbViewApp {
  filter = {};
}
