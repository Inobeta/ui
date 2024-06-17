import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CommonModule } from "@angular/common";
import { Component, Type, inject } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { IbToastModule } from "../../../toast";
import { IViewState } from "../../store/reducer";
import { IbViewModule } from "../../view.module";
import { IbTableViewGroup } from "./table-view-group.component";
import { IbTableUrlService } from "../../../kai-table";
import { RouterTestingModule } from "@angular/router/testing";

const initialState: IViewState = {
  views: [],
};

describe("IbTableViewGroup", () => {
  let fixture: ComponentFixture<IbViewApp>;
  let component: IbTableViewGroup;
  let loader: HarnessLoader;
  let store: MockStore;

  beforeEach(() => {
    fixture = createComponent(IbViewApp);
    component = fixture.debugElement.query(
      By.directive(IbTableViewGroup)
    ).componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    store = TestBed.inject(MockStore);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

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
    component.dirty = true;
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
    component.dirty = true;
    component.handleChangeView(component.defaultView);
    expect(component.activeView.id).toBe("__ibTableView__all");
  });
});

function configureModule<T>(type: Type<T>) {
  TestBed.configureTestingModule({
    declarations: [type],
    imports: [
      CommonModule,
      BrowserAnimationsModule,
      IbToastModule,
      IbViewModule,
      StoreModule.forRoot({}),
      TranslateModule.forRoot({
        extend: true,
      }),
      RouterTestingModule.withRoutes([])
    ],
    providers: [
      provideMockStore({ initialState }),
      IbTableUrlService
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
  template: `<ib-view-group
    viewGroupName="issues"
    [viewDataAccessor]="viewDataAccessor"
  ></ib-view-group>`,
})
class IbViewApp {
  filter = { };

  viewDataAccessor = () => ({
    filter: this.filter,
  });
}
