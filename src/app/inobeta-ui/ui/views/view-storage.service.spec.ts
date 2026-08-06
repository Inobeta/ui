import { TestBed } from "@angular/core/testing";
import { IbViewStorageService } from "./view-storage.service";
import {
  IB_VIEWS_STORAGE_KEY,
  IB_VIEWS_DEFAULT_STORAGE_KEY,
} from "./view.tokens";
import {
  IbSavedView,
  IbViewSnapshot,
  IbViewsStorageEnvelope,
} from "./view.types";

/** Returns a fake saved view with the given ID and name. */
function makeView(id: string, name: string, overrides?: Partial<IbViewSnapshot>): IbSavedView {
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

describe("IbViewStorageService", () => {
  let service: IbViewStorageService;
  const originalSetItem = localStorage.setItem;

  /** Helper to construct the expected localStorage key for a group. */
  function storageKey(groupName: string): string {
    return `${IB_VIEWS_DEFAULT_STORAGE_KEY}:${groupName}`;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IbViewStorageService,
        { provide: IB_VIEWS_STORAGE_KEY, useValue: IB_VIEWS_DEFAULT_STORAGE_KEY },
      ],
    });
    service = TestBed.inject(IbViewStorageService);

    // Reset in-memory state since the service is providedIn: 'root'
    // and _groups may retain stale BehaviorSubjects across tests.
    service.ngOnDestroy();

    // Start each test with a clean localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.setItem = originalSetItem;
  });

  // ---------------------------------------------------------------------------
  // getViews / watchViews — empty state
  // ---------------------------------------------------------------------------

  it("should return an empty array for an unknown group", () => {
    expect(service.getViews("group-a")).toEqual([]);
  });

  it("should emit an empty array via watchViews for an unknown group", async () => {
    await new Promise<void>((resolve) => service.watchViews("group-a").subscribe((views) => {
      expect(views).toEqual([]);
      resolve();
    }));
  });

  // ---------------------------------------------------------------------------
  // resolveView
  // ---------------------------------------------------------------------------

  it("should return null when the group is empty", () => {
    expect(service.resolveView("group-a", "any-id")).toBeNull();
  });

  it("should return null when the view ID does not exist", () => {
    service.createView("group-a", makeView("v1", "View One"));
    expect(service.resolveView("group-a", "missing-id")).toBeNull();
  });

  it("should resolve a view by its ID", () => {
    service.createView("group-a", makeView("v1", "View One"));
    const resolved = service.resolveView("group-a", "v1");
    expect(resolved).not.toBeNull();
    expect(resolved!.id).toBe("v1");
    expect(resolved!.name).toBe("View One");
  });

  // ---------------------------------------------------------------------------
  // CRUD: create
  // ---------------------------------------------------------------------------

  it("should create a view and append it to the group", () => {
    service.createView("group-a", makeView("v1", "First"));
    service.createView("group-a", makeView("v2", "Second"));

    const views = service.getViews("group-a");
    expect(views.length).toBe(2);
    expect(views[0].id).toBe("v1");
    expect(views[1].id).toBe("v2");
  });

  it("should persist created views in localStorage", () => {
    service.createView("group-a", makeView("v1", "First"));

    const raw = localStorage.getItem(storageKey("group-a"));
    expect(raw).not.toBeNull();
    const envelope: IbViewsStorageEnvelope = JSON.parse(raw!);
    expect(envelope.version).toBe(1);
    expect(envelope.views.length).toBe(1);
    expect(envelope.views[0].id).toBe("v1");
  });

  // ---------------------------------------------------------------------------
  // CRUD: save (update data)
  // ---------------------------------------------------------------------------

  it("should update a view's data in place", () => {
    service.createView("group-a", makeView("v1", "First", { pageSize: 20 }));

    service.saveView("group-a", "v1", {
      filters: { status: { operator: "equals" as const, value: "open" } },
      sort: { active: "name", direction: "asc" },
      pageSize: 50,
      aggregatedColumns: { amount: "sum" },
    });

    const views = service.getViews("group-a");
    expect(views.length).toBe(1);
    expect(views[0].data.pageSize).toBe(50);
    expect(views[0].data.sort!.active).toBe("name");
    expect(views[0].name).toBe("First"); // name unchanged
  });

  it("should not affect other views during save", () => {
    service.createView("group-a", makeView("v1", "First"));
    service.createView("group-a", makeView("v2", "Second"));

    service.saveView("group-a", "v1", {
      filters: null,
      sort: null,
      pageSize: 30,
      aggregatedColumns: {},
    });

    const views = service.getViews("group-a");
    expect(views[0].data.pageSize).toBe(30);
    expect(views[1].data.pageSize).toBe(20);
  });

  // ---------------------------------------------------------------------------
  // CRUD: rename
  // ---------------------------------------------------------------------------

  it("should rename a view in place", () => {
    service.createView("group-a", makeView("v1", "First"));

    service.renameView("group-a", "v1", "Renamed");

    const views = service.getViews("group-a");
    expect(views[0].name).toBe("Renamed");
    expect(views[0].id).toBe("v1"); // ID unchanged
  });

  // ---------------------------------------------------------------------------
  // CRUD: delete
  // ---------------------------------------------------------------------------

  it("should delete a view by ID", () => {
    service.createView("group-a", makeView("v1", "First"));
    service.createView("group-a", makeView("v2", "Second"));

    service.deleteView("group-a", "v1");

    const views = service.getViews("group-a");
    expect(views.length).toBe(1);
    expect(views[0].id).toBe("v2");
  });

  // ---------------------------------------------------------------------------
  // CRUD: reorder
  // ---------------------------------------------------------------------------

  it("should persist a new view order", () => {
    service.createView("group-a", makeView("v1", "First"));
    service.createView("group-a", makeView("v2", "Second"));
    service.createView("group-a", makeView("v3", "Third"));

    // Reverse order
    service.reorderViews("group-a", [
      makeView("v3", "Third"),
      makeView("v2", "Second"),
      makeView("v1", "First"),
    ]);

    const views = service.getViews("group-a");
    expect(views.length).toBe(3);
    expect(views[0].id).toBe("v3");
    expect(views[1].id).toBe("v2");
    expect(views[2].id).toBe("v1");
  });

  // ---------------------------------------------------------------------------
  // Group isolation
  // ---------------------------------------------------------------------------

  it("should isolate views between two groups", () => {
    service.createView("group-a", makeView("a1", "A-One"));
    service.createView("group-b", makeView("b1", "B-One"));

    expect(service.getViews("group-a").length).toBe(1);
    expect(service.getViews("group-b").length).toBe(1);
    expect(service.getViews("group-a")[0].id).toBe("a1");
    expect(service.getViews("group-b")[0].id).toBe("b1");
  });

  it("should use separate localStorage keys per group", () => {
    service.createView("group-a", makeView("a1", "A-One"));
    service.createView("group-b", makeView("b1", "B-One"));

    expect(localStorage.getItem(storageKey("group-a"))).not.toBeNull();
    expect(localStorage.getItem(storageKey("group-b"))).not.toBeNull();
    expect(storageKey("group-a")).not.toBe(storageKey("group-b"));
  });

  it("should allow the same ID in different groups", () => {
    service.createView("group-a", makeView("shared-id", "A View"));
    service.createView("group-b", makeView("shared-id", "B View"));

    const resolvedA = service.resolveView("group-a", "shared-id");
    const resolvedB = service.resolveView("group-b", "shared-id");

    expect(resolvedA).not.toBeNull();
    expect(resolvedB).not.toBeNull();
    expect(resolvedA!.name).toBe("A View");
    expect(resolvedB!.name).toBe("B View");
  });

  // ---------------------------------------------------------------------------
  // Reload / persist-and-read
  // ---------------------------------------------------------------------------

  it("should persist views and restore them on fresh service read", () => {
    service.createView("group-a", makeView("v1", "Persisted"));
    service.reorderViews("group-a", [
      makeView("v3", "Third"),
      makeView("v1", "Persisted"),
    ]);

    // Simulate a fresh service by creating a new instance
    const freshService = TestBed.inject(IbViewStorageService);
    const views = freshService.getViews("group-a");

    expect(views.length).toBe(2);
    expect(views[0].id).toBe("v3");
    expect(views[1].id).toBe("v1");
    expect(views[1].name).toBe("Persisted");
  });

  // ---------------------------------------------------------------------------
  // watchViews reactivity
  // ---------------------------------------------------------------------------

  it("should emit initial empty state via watchViews", async () => {
    await new Promise<void>((resolve) => service.watchViews("group-a").subscribe((views) => {
      expect(views).toEqual([]);
      resolve();
    }));
  });

  it("should reflect create in subsequent getViews call", () => {
    service.createView("group-a", makeView("v1", "First"));
    const views = service.getViews("group-a");
    expect(views.length).toBe(1);
    expect(views[0].name).toBe("First");
  });

  it("should observe a created view in a watchViews subscription", () => {
    // Create first, then subscribe to get the current state
    service.createView("group-a", makeView("v1", "First"));

    let received: IbSavedView[] = [];
    service.watchViews("group-a").subscribe((views) => {
      received = views;
    });

    expect(received.length).toBe(1);
    expect(received[0].name).toBe("First");
  });

  // ---------------------------------------------------------------------------
  // Malformed / missing / wrong-version / invalid-shape storage
  // ---------------------------------------------------------------------------

  it("should return empty array for missing storage key", () => {
    // No data has been stored — already covered, but explicit
    expect(service.getViews("nonexistent")).toEqual([]);
  });

  it("should return empty array for malformed JSON", () => {
    localStorage.setItem(storageKey("malformed"), "not-json{{{");
    const freshService = TestBed.inject(IbViewStorageService);
    expect(freshService.getViews("malformed")).toEqual([]);
  });

  it("should return empty array for wrong version", () => {
    localStorage.setItem(
      storageKey("old-version"),
      JSON.stringify({ version: 2, views: [makeView("v1", "Test")] })
    );
    const freshService = TestBed.inject(IbViewStorageService);
    expect(freshService.getViews("old-version")).toEqual([]);
  });

  it("should return empty array for missing version field", () => {
    localStorage.setItem(
      storageKey("no-version"),
      JSON.stringify({ views: [makeView("v1", "Test")] })
    );
    const freshService = TestBed.inject(IbViewStorageService);
    expect(freshService.getViews("no-version")).toEqual([]);
  });

  it("should return empty array for non-array views field", () => {
    localStorage.setItem(
      storageKey("bad-views"),
      JSON.stringify({ version: 1, views: "not-an-array" })
    );
    const freshService = TestBed.inject(IbViewStorageService);
    expect(freshService.getViews("bad-views")).toEqual([]);
  });

  it("should return empty array for null storage value", () => {
    localStorage.setItem(storageKey("null-value"), JSON.stringify(null));
    const freshService = TestBed.inject(IbViewStorageService);
    expect(freshService.getViews("null-value")).toEqual([]);
  });

  it("should return empty array for non-object JSON value", () => {
    localStorage.setItem(storageKey("primitive"), JSON.stringify(42));
    const freshService = TestBed.inject(IbViewStorageService);
    expect(freshService.getViews("primitive")).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Write failure
  // ---------------------------------------------------------------------------

  it("should throw on localStorage write failure and keep previous state", () => {
    service.createView("group-a", makeView("v1", "First"));

    // Mock setItem to throw
    spyOn(localStorage, "setItem").and.throwError("QuotaExceededError");

    expect(() => {
      service.createView("group-a", makeView("v2", "Second"));
    }).toThrow();

    // Previous state should be retained (createView throws before updating BehaviorSubject)
    const views = service.getViews("group-a");
    expect(views.length).toBe(1);
    expect(views[0].id).toBe("v1");
  });

  it("should throw on save failure and keep previous state", () => {
    service.createView("group-a", makeView("v1", "First", { pageSize: 20 }));

    spyOn(localStorage, "setItem").and.throwError("QuotaExceededError");

    expect(() => {
      service.saveView("group-a", "v1", {
        filters: null,
        sort: null,
        pageSize: 99,
        aggregatedColumns: {},
      });
    }).toThrow();

    // pageSize should remain at 20 (previous state)
    const views = service.getViews("group-a");
    expect(views[0].data.pageSize).toBe(20);
  });

  // ---------------------------------------------------------------------------
  // generateId
  // ---------------------------------------------------------------------------

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(service.generateId());
    }
    expect(ids.size).toBe(50);
  });

  it("should generate non-empty IDs", () => {
    const id = service.generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  // ---------------------------------------------------------------------------
  // Custom storage key prefix
  // ---------------------------------------------------------------------------

  it("should use the configured storage key prefix", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        IbViewStorageService,
        { provide: IB_VIEWS_STORAGE_KEY, useValue: "custom-prefix-test" },
      ],
    });
    const customService = TestBed.inject(IbViewStorageService);

    customService.createView("group-x", makeView("v1", "Test"));
    expect(localStorage.getItem("custom-prefix-test:group-x")).not.toBeNull();
    expect(localStorage.getItem(`${IB_VIEWS_DEFAULT_STORAGE_KEY}:group-x`)).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  it("should complete all subjects on destroy", () => {
    service.createView("group-a", makeView("v1", "First"));
    service.createView("group-b", makeView("v2", "Second"));

    let completed = false;
    service.watchViews("group-a").subscribe({
      complete: () => (completed = true),
    });

    service.ngOnDestroy();
    expect(completed).toBeTrue();
  });
});
