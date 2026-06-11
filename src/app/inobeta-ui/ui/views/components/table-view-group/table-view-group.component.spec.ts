import { Component, Type } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";

import { IbTableViewGroup } from "./table-view-group.component";
import { IbViewSnapshot, DEFAULT_VIEW_ID } from "../../view.types";
import { IbViewService } from "../../view.service";
import { EventEmitter } from "@angular/core";

describe('IbTableViewGroup', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: IbTableViewGroup;
  let viewService: jasmine.SpyObj<IbViewService>;

  const makeView = (id: string, name: string): IbViewSnapshot => ({
    id,
    name,
    groupName: 'issues',
    componentType: 'table',
    data: {},
  });

  beforeEach(async () => {
    viewService = jasmine.createSpyObj('IbViewService', [
      'getViews',
      'openAddViewDialog',
      'addView',
      'openDeleteViewDialog',
      'deleteView',
      'openRenameViewDialog',
      'renameView',
      'openDuplicateViewDialog',
      'duplicateView',
      'saveView',
      'openSaveAsDialog',
      'openSaveChangesDialog',
    ]);

    // Default: return two saved views
    viewService.getViews.and.returnValue([
      makeView('v1', 'Alpha'),
      makeView('v2', 'Beta'),
    ]);

    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [
        IbTableViewGroup,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: IbViewService, useValue: viewService },
      ],
    }).compileComponents();
  });

  function createHost(initialViewId?: string, stateAccessor?: () => unknown) {
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    host.groupName = 'issues';
    host.componentType = 'table';
    host.stateAccessor = stateAccessor ?? (() => ({ }));
    host.initialViewId = initialViewId ?? null;
    fixture.detectChanges();

    component = fixture.debugElement
      .query(By.directive(IbTableViewGroup))
      .componentInstance as IbTableViewGroup;
  }

  it('creates successfully', () => {
    createHost();
    expect(component).toBeTruthy();
  });

  it('initialViewId matches a view -> sets active and emits initial', () => {
    // create host but intercept EventEmitter.emit globally for this spec
    const originalEmit = (EventEmitter.prototype as any).emit;
    const emitSpy = spyOn(EventEmitter.prototype as any, 'emit').and.callThrough();

    createHost('v1');

    expect(component.activeView().id).toBe('v1');
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'v1', initial: true }));

    // restore original
    (EventEmitter.prototype as any).emit = originalEmit;
  });

  it('initialViewId does not match -> uses default and does not emit', () => {
    createHost('no-match');
    spyOn(component.ibViewChanged, 'emit');

    expect(component.activeView().id).toBe(DEFAULT_VIEW_ID);
    expect(component.ibViewChanged.emit).not.toHaveBeenCalled();
  });

  it('handleAddView calls addView, sets active and emits', () => {
    createHost(undefined, () => ({ foo: 'bar' }));
    const newView = makeView('newid', 'New');
    newView.data = { foo: 'bar' };

    viewService.openAddViewDialog.and.returnValue(of({ name: 'New' }));
    viewService.addView.and.returnValue(newView);
    spyOn(component.ibViewChanged, 'emit');

    component.handleAddView();

    expect(viewService.addView).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'New', groupName: 'issues', componentType: 'table', data: { foo: 'bar' } }));
    expect(component.activeView().id).toBe('newid');
    expect(component.ibViewChanged.emit).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'newid', initial: false }));
  });

  it('handleRemoveView calls deleteView and resets to default', () => {
    createHost();
    const view = makeView('to-delete', 'X');
    // Simulate delete dialog confirmed (service exposes Observable<void>)
    viewService.openDeleteViewDialog.and.returnValue(of(undefined));
    viewService.deleteView.and.callFake(() => {});

    component.handleRemoveView(view);

    expect(viewService.deleteView).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'to-delete' }));
    expect(component.activeView().id).toBe(DEFAULT_VIEW_ID);
  });

  it('handleRenameView calls renameView and updates active name', () => {
    createHost();
    const view = makeView('r1', 'Old');
    const renamed = { ...view, name: 'Renamed' };
    viewService.openRenameViewDialog.and.returnValue(of({ name: 'Renamed' }));
    viewService.renameView.and.returnValue(renamed);

    component.handleRenameView(view);

    expect(viewService.renameView).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'r1' }), 'Renamed');
    expect(component.activeView().name).toBe('Renamed');
  });

  it('handleDuplicateView duplicates and sets active to copy', () => {
    createHost(undefined, () => ({ a: 1 }));
    const view = makeView('vdup', 'Orig');
    const copy = { ...view, id: 'vdup-copy', name: 'Copy' };
    viewService.openDuplicateViewDialog.and.returnValue(of({ name: 'Copy' }));
    viewService.duplicateView.and.returnValue(copy);

    component.handleDuplicateView(view);

    expect(viewService.duplicateView).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Copy', groupName: 'issues', componentType: 'table', data: { a: 1 } }));
    expect(component.activeView().id).toBe('vdup-copy');
  });

  it('handleSaveView on default delegates to add flow', () => {
    createHost(undefined, () => ({ x: 1 }));
    spyOn(component, 'handleAddView');

    // Ensure active is default
    component.activeView.set(component.defaultView);
    component.handleSaveView();

    expect(component.handleAddView).toHaveBeenCalled();
  });

  it('handleSaveView on named view calls saveView', () => {
    createHost(undefined, () => ({ x: 2 }));
    const named = makeView('save1', 'Saved');
    viewService.saveView.and.returnValue(named);

    component.activeView.set(named);
    component.handleSaveView();

    expect(viewService.saveView).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'save1' }), { x: 2 });
    expect(component.activeView().id).toBe('save1');
  });

  it('handleChangeView when not dirty updates active immediately', () => {
    createHost();
    const view = makeView('vchange', 'V');
    component.dirty.set(false);

    component.handleChangeView(view);

    expect(component.activeView().id).toBe('vchange');
  });

  it('handleChangeView when dirty and default active opens saveAs dialog and adds', () => {
    createHost(undefined, () => ({ k: 'v' }));
    const target = makeView('target', 'T');

    // set active to default and dirty
    component.activeView.set(component.defaultView);
    component.dirty.set(true);

    viewService.openSaveAsDialog.and.returnValue(of({ name: 'SavedAs', confirmed: true }));
    viewService.addView.and.returnValue(makeView('sa1', 'SavedAs'));

    component.handleChangeView(target);

    expect(viewService.openSaveAsDialog).toHaveBeenCalled();
    expect(viewService.addView).toHaveBeenCalled();
    expect(component.activeView().id).toBe('target');
  });

  it('handleChangeView when dirty and named active opens saveChanges dialog and saves', () => {
    createHost(undefined, () => ({ z: 9 }));
    const current = makeView('cur', 'Cur');
    const target = makeView('tgt', 'Tgt');

    component.activeView.set(current);
    component.dirty.set(true);

    viewService.openSaveChangesDialog.and.returnValue(of({ confirmed: true }));
    viewService.saveView.and.returnValue(current);

    component.handleChangeView(target);

    expect(viewService.openSaveChangesDialog).toHaveBeenCalledWith(current);
    expect(viewService.saveView).toHaveBeenCalled();
    expect(component.activeView().id).toBe('tgt');
  });

  it('_checkDirty is order-insensitive for objects', () => {
    // Provide a stateAccessor returning {a:1,b:2}
    createHost(undefined, () => ({ a: 1, b: 2 }));
    // set active view data with fields in different order
    component.activeView.set({ id: 'x', name: '', groupName: 'issues', componentType: 'table', data: { b: 2, a: 1 } });

    const dirty = (component as any)._checkDirty();
    expect(dirty).toBeFalse();
  });

  it('handleDiscardChanges resets dirty to false', () => {
    createHost();
    component.dirty.set(true);
    component.handleDiscardChanges();
    expect(component.dirty()).toBeFalse();
  });
});

@Component({
  template: `
    <ib-table-view-group
      [groupName]="groupName"
      [componentType]="componentType"
      [stateAccessor]="stateAccessor"
      [initialViewId]="initialViewId"
    ></ib-table-view-group>
  `,
  standalone: false,
})
class TestHostComponent {
  groupName = 'issues';
  componentType = 'table';
  stateAccessor: () => unknown = () => ({});
  initialViewId: string | null = null;
}
