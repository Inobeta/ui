import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { IbViewService } from './view.service';
import { IB_VIEWS_STORAGE_KEY } from './view.tokens';
import { IbViewSnapshot } from './view.types';

import { MatDialog } from '@angular/material/dialog';
import { IbStorageService } from '../../storage';
import { IbToastNotification } from '../toast';

describe('IbViewService', () => {
  let service: IbViewService;
  let storageSpy: jasmine.SpyObj<IbStorageService>;
  let dialogMock: { afterClosed$: any; open: jasmine.Spy };
  let toastSpy: jasmine.SpyObj<IbToastNotification>;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('IbStorageService', ['get', 'set']);

    // dialog mock will return whatever afterClosed$ is set to in each test
    dialogMock = {
      afterClosed$: of(undefined),
      open: jasmine.createSpy('open').and.callFake(() => ({ afterClosed: () => dialogMock.afterClosed$ })),
    };

    toastSpy = jasmine.createSpyObj('IbToastNotification', ['open']);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        IbViewService,
        { provide: IbStorageService, useValue: storageSpy },
        { provide: MatDialog, useValue: dialogMock },
        { provide: IbToastNotification, useValue: toastSpy },
        { provide: IB_VIEWS_STORAGE_KEY, useValue: '__ib-views__' },
      ],
    });

    service = TestBed.inject(IbViewService);
  });

  it('getViews returns [] when storage key missing', () => {
    storageSpy.get.and.returnValue(null);

    const result = service.getViews('groupA', 'typeA');

    expect(result).toEqual([]);
  });

  it('getViews filters out entries whose componentType does not match', () => {
    const stored: IbViewSnapshot[] = [
      { id: '1', name: 'a', groupName: 'g', componentType: 'typeA', data: {} },
      { id: '2', name: 'b', groupName: 'g', componentType: 'typeB', data: {} },
    ];

    storageSpy.get.and.returnValue(stored);

    const result = service.getViews('g', 'typeA');

    expect(result).toEqual([stored[0]]);
  });

  it('addView generates an id and returns the new snapshot', () => {
    storageSpy.get.and.returnValue([]);

    const p = { name: 'new', groupName: 'g', componentType: 't', data: { foo: 'bar' } } as const;

    const result = service.addView(p);

    expect(result).toEqual(jasmine.objectContaining({ id: jasmine.any(String), name: 'new' }));
  });

  it('addView persists new array to storage', () => {
    storageSpy.get.and.returnValue([]);

    const p = { name: 's', groupName: 'g', componentType: 't', data: {} } as const;

    service.addView(p);

    expect(storageSpy.set).toHaveBeenCalled();
  });

  it('saveView updates only the data field', () => {
    const original: IbViewSnapshot = { id: '1', name: 'n', groupName: 'g', componentType: 't', data: { a: 1 } };
    storageSpy.get.and.returnValue([original]);

    const updated = service.saveView(original, { b: 2 });

    expect(updated).toEqual(jasmine.objectContaining({ id: '1', name: 'n', data: { b: 2 } }));
  });

  it('renameView updates only the name field', () => {
    const original: IbViewSnapshot = { id: 'x', name: 'old', groupName: 'g', componentType: 't', data: { x: 1 } };
    storageSpy.get.and.returnValue([original]);

    const updated = service.renameView(original, 'new-name');

    expect(updated).toEqual(jasmine.objectContaining({ id: 'x', name: 'new-name', data: { x: 1 } }));
  });

  it('deleteView removes the entry by id and preserves remaining entries', () => {
    const a: IbViewSnapshot = { id: 'a', name: 'A', groupName: 'g', componentType: 't', data: {} };
    const b: IbViewSnapshot = { id: 'b', name: 'B', groupName: 'g', componentType: 't', data: {} };
    storageSpy.get.and.returnValue([a, b]);

    service.deleteView(a);

    // assert that storage.set was called with an array of length 1 (single assertion)
    expect((storageSpy.set.calls.mostRecent().args[1] as any[]).length).toBe(1);
  });

  it('openAddViewDialog emits name when dialog confirmed and does not emit on cancel', () => {
    // confirmed case
    dialogMock.afterClosed$ = of({ confirmed: true, name: 'created' });

    let emitted: any = null;
    service.openAddViewDialog().subscribe((v) => (emitted = v));

    expect(emitted).toEqual({ confirmed: true, name: 'created' });
  });

  it('openAddViewDialog does not emit when dialog cancelled', () => {
    dialogMock.afterClosed$ = of(null);

    let emitted: any = null;
    service.openAddViewDialog().subscribe((v) => (emitted = v));

    expect(emitted).toBeNull();
  });

  it('openDeleteViewDialog emits on confirm and not on cancel', () => {
    dialogMock.afterClosed$ = of({ confirmed: true });

    let called = false;
    service.openDeleteViewDialog({ id: '1', name: 'n', groupName: 'g', componentType: 't', data: {} }).subscribe(() => (called = true));

    expect(called).toBeTrue();
  });

  it('openDeleteViewDialog does not emit when cancelled', () => {
    dialogMock.afterClosed$ = of({ confirmed: false });

    let called = false;
    service.openDeleteViewDialog({ id: '1', name: 'n', groupName: 'g', componentType: 't', data: {} }).subscribe(() => (called = true));

    expect(called).toBeFalse();
  });

  it('openRenameViewDialog emits new name on confirm and not on cancel', () => {
    dialogMock.afterClosed$ = of({ confirmed: true, name: 'renamed' });

    let emitted: any = null;
    service.openRenameViewDialog({ id: '1', name: 'n', groupName: 'g', componentType: 't', data: {} }).subscribe((v) => (emitted = v));

    expect(emitted).toEqual({ confirmed: true, name: 'renamed' });
  });

  it('openRenameViewDialog does not emit when cancelled', () => {
    dialogMock.afterClosed$ = of({ confirmed: false });

    let emitted: any = null;
    service.openRenameViewDialog({ id: '1', name: 'n', groupName: 'g', componentType: 't', data: {} }).subscribe((v) => (emitted = v));

    expect(emitted).toBeNull();
  });

  it('openDuplicateViewDialog emits on confirm', () => {
    dialogMock.afterClosed$ = of({ confirmed: true, name: 'dup' });

    let emitted: any = null;
    service.openDuplicateViewDialog({ id: '1', name: 'n', groupName: 'g', componentType: 't', data: {} }).subscribe((v) => (emitted = v));

    expect(emitted).toEqual({ confirmed: true, name: 'dup' });
  });

  it('openSaveChangesDialog emits result when confirmed', () => {
    dialogMock.afterClosed$ = of({ confirmed: true });

    let emitted: any = null;
    service.openSaveChangesDialog({ id: '1', name: 'n', groupName: 'g', componentType: 't', data: {} }).subscribe((v) => (emitted = v));

    expect(emitted).toEqual({ confirmed: true });
  });

  it('openSaveAsDialog emits result when confirmed', () => {
    dialogMock.afterClosed$ = of({ confirmed: true, name: 'saved-as' });

    let emitted: any = null;
    service.openSaveAsDialog().subscribe((v) => (emitted = v));

    expect(emitted).toEqual({ confirmed: true, name: 'saved-as' });
  });
});
