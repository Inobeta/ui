import { Portal } from "@angular/cdk/portal";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TranslateModule } from "@ngx-translate/core";
import { Subject, of } from "rxjs";
import { IbToastModule } from "../../../toast";
import { IbFilterOperator } from "../../../kai-filter/filter.types";
import { IbTableViewsData } from "../../../kai-table/table-views-host";
import { IbTableUrlService } from "../../../kai-table/table-url.service";
import { IViewState } from "../../store/reducer";
import { IView } from "../../store/views/table-view";
import { IbViewModule } from "../../view.module";
import { IbTableViewGroup } from "./table-view-group.component";
import { RouterTestingModule } from "@angular/router/testing";
import { provideStore } from "@ngrx/store";

const initialState: IViewState = {
  views: [],
};

describe("IbTableViewGroup", () => {
  let fixture: ComponentFixture<IbViewApp>;
  let component: IbTableViewGroup;
  let loader: HarnessLoader;
  let store: MockStore;
  let tableUrl: IbTableUrlService;

  beforeEach(() => {
    fixture = createComponent(IbViewApp);
    component = fixture.debugElement.query(
      By.directive(IbTableViewGroup)
    ).componentInstance;
    tableUrl = TestBed.inject(IbTableUrlService);
    store = TestBed.inject(MockStore);

    // Set up empty filter schema so defaultView data matches the accessor
    tableUrl.emptyFilterSchema = { issues: {} };

    // Mimic what the IbTable does: initialize the views host via methods
    component.setViewDataAccessor(() => ({
      filter: {},
      pageSize: 20,
      aggregatedColumns: {},
      sort: { active: "", direction: "" },
    }));
    component.setViewGroupName("issues");
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  describe("IbTableViewsHost contract", () => {
    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("setViewGroupName should set viewGroupName and subscribe views$", () => {
      expect(component.viewGroupName).toBe("issues");
      expect(component.views$).toBeDefined();
    });

    it("setViewDataAccessor should store the accessor function", () => {
      const accessor = () => ({
        filter: { color: { operator: IbFilterOperator.EQUALS, value: "red" } },
        pageSize: 10,
        aggregatedColumns: { amount: "sum" },
        sort: { active: "name", direction: "asc" as const },
      });
      component.setViewDataAccessor(accessor);
      fixture.detectChanges();

      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("handleStateChanges should subscribe and update dirty when data changes", () => {
      const changes$ = new Subject<void>();
      component.handleStateChanges(changes$);
      fixture.detectChanges();

      // Initially not dirty (accessor returns same as default view data)
      expect(component.dirty).toBeFalse();

      // Change the accessor to return different data
      component.setViewDataAccessor(() => ({
        filter: { color: { operator: IbFilterOperator.EQUALS, value: "blue" } },
        pageSize: 50,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));

      // Emit change signal
      changes$.next();
      fixture.detectChanges();

      expect(component.dirty).toBeTrue();
    });

    it("activeViewChanged should emit non-initial view changes", () => {
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));

      // Emit a view with initial=true (should be filtered out)
      const initialView: IView = {
        id: "__ibTableView__all",
        name: "",
        groupName: "issues",
        data: {
          filter: {},
          pageSize: 20,
          aggregatedColumns: {},
          sort: { active: "", direction: "" },
        },
        initial: true,
      };
      (component as any)._activeView.next(initialView);
      fixture.detectChanges();
      expect(emitted.length).toBe(0);

      // Emit a view without initial (should be emitted)
      const realView: IView = {
        id: "view-1",
        name: "My View",
        groupName: "issues",
        data: {
          filter: { color: { operator: IbFilterOperator.EQUALS, value: "red" } },
          pageSize: 10,
          aggregatedColumns: {},
          sort: { active: "name", direction: "asc" },
        },
      };
      (component as any)._activeView.next(realView);
      fixture.detectChanges();
      expect(emitted.length).toBe(1);
      expect(emitted[0].viewId).toBe("view-1");
      expect(emitted[0].filter).toEqual({
        color: { operator: IbFilterOperator.EQUALS, value: "red" },
      });
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

    it("checkViewDataChanges should return false when data matches", () => {
      // With default accessor returning same as defaultView.data
      expect(component.checkViewDataChanges()).toBeFalse();
    });

    it("checkViewDataChanges should return true when data differs", () => {
      component.setViewDataAccessor(() => ({
        filter: { color: { operator: IbFilterOperator.EQUALS, value: "green" } },
        pageSize: 30,
        aggregatedColumns: {},
        sort: { active: "", direction: "" },
      }));
      expect(component.checkViewDataChanges()).toBeTrue();
    });

    it("checkViewDataChanges should return false when accessor returns undefined", () => {
      component.setViewDataAccessor(() => undefined as unknown as IbTableViewsData);
      expect(component.checkViewDataChanges()).toBeFalse();
    });

    it("activeViewChanged should emit view data after view selection via URL", () => {
      const targetView: IView = {
        id: "saved-view-1",
        name: "Saved View",
        groupName: "issues",
        data: {
          filter: { status: { operator: IbFilterOperator.EQUALS, value: "open" } },
          pageSize: 50,
          aggregatedColumns: {},
          sort: { active: "name", direction: "asc" },
        },
      };

      // Set up store with views
      store.setState({
        ibViews: {
          views: [targetView],
        },
      });
      store.refreshState();

      // Spy on URL service to return a matching view ID
      spyOn(tableUrl, "getActiveView").and.returnValue("saved-view-1");

      // Re-initialize view group name to trigger URL-based view selection
      const emitted: any[] = [];
      component.activeViewChanged.subscribe((v) => emitted.push(v));
      component.setViewGroupName("issues");
      fixture.detectChanges();

      expect(component.activeView.id).toBe("saved-view-1");
    });
  });

  describe("view CRUD operations", () => {
    it("should add a view", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "related" })
      );
      component.handleAddView();
      expect(component.activeView.name).toBe("related");
    });

    it("should remove a view", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "related" })
      );
      spyOn(component.viewService, "openDeleteViewDialog").and.returnValue(
        of(true)
      );

      component.handleAddView();
      fixture.detectChanges();
      component.handleRemoveView(component.activeView);
      fixture.detectChanges();
      expect(component.activeView.id).toBe("__ibTableView__all");
    });

    it("should rename a view", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "related" })
      );
      spyOn(component.viewService, "openRenameViewDialog").and.returnValue(
        of({ name: "dandori" })
      );

      component.handleAddView();
      component.handleRenameView(component.activeView);
      expect(component.activeView.name).toBe("dandori");
    });

    it("should duplicate a view", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "dandori" })
      );
      spyOn(component.viewService, "openDuplicateViewDialog").and.returnValue(
        of({ name: "Copy of dandori" })
      );

      component.handleAddView();
      component.handleDuplicateView(component.activeView);
      expect(component.activeView.name).toBe("Copy of dandori");
    });

    it("should save a view", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "dandori" })
      );

      component.handleAddView();
      fixture.componentInstance.filter = { issueType: "dandori" };
      component.handleSaveView();
      /*  expect(component.activeView.data).toEqual({
            filter: { issueType: "dandori" },
          });*/
    });

    it("should save a new view when default is selected", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "dandori", confirmed: true })
      );

      fixture.componentInstance.filter = { issueType: "dandori" };
      component.handleSaveView();
      /*  expect(component.activeView.data).toEqual({
            filter: { issueType: "dandori" },
          });*/
    });

    it("should change a view", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "dandori" })
      );
      component.handleAddView();
      component.handleChangeView(component.defaultView);
      expect(component.activeView.id).toBe("__ibTableView__all");
    });

    it("should save as view, default -> any", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "time" })
      );
      spyOn(component.viewService, "openSaveAsDialog").and.returnValue(
        of({ name: "dandori", confirmed: true })
      );

      component.handleAddView();
      const timeView = component.activeView;
      component.handleChangeView(component.defaultView);
      expect(component.activeView.id).toBe("__ibTableView__all");

      fixture.componentInstance.filter = { issueType: "dandori" };
      (component as any)._dirty = true;
      component.handleChangeView(timeView);

      expect(component.activeView.name).toBe("time");
    });

    it("should save changes, any view -> any", () => {
      spyOn(component.viewService, "openAddViewDialog").and.returnValue(
        of({ name: "time" })
      );
      spyOn(component.viewService, "openSaveChangesDialog").and.returnValue(
        of({ name: "dandori", confirmed: true })
      );

      component.handleAddView();
      fixture.componentInstance.filter = { issueType: "dandori" };
      (component as any)._dirty = true;
      component.handleChangeView(component.defaultView);
      expect(component.activeView.id).toBe("__ibTableView__all");
    });
  });
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [
      CommonModule,
      NoopAnimationsModule,
      IbToastModule,
      IbViewModule,
      TranslateModule.forRoot({
        extend: true,
      }),
      RouterTestingModule.withRoutes([]),
    ],
    providers: [
      provideStore(),
      provideMockStore({
        initialState: {
          ibViews: initialState,
        },
      }),
      IbTableUrlService,
    ],
  }).compileComponents();
}

function createComponent<T>(type: Type<T>): ComponentFixture<T> {
  configureModule(type);

  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

export const createViewComponent = createComponent;

@Component({
  template: ` <ib-view-group></ib-view-group> `,
  standalone: false,
})
class IbViewApp {
  filter = {};
}
