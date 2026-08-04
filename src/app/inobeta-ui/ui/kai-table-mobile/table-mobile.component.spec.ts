import { DataSource } from '@angular/cdk/collections';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, computed, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IbDataExportModule } from '../data-export';
import { IbColumn } from '../kai-table/columns';
import { IbKaiRowGroupDirective } from '../kai-table/rowgroup';
import { IbKaiTableAction } from '../kai-table/action';
import { OVERRIDE_EXPORT_FORMATS } from '../data-export/data-export.service';
import { IbKaiTableMobileComponent } from './table-mobile.component';
import { IbKaiTableMobileItemComponent } from './table-mobile-item.component';

class MobileDataSource extends DataSource<unknown> {
  readonly rows = new Subject<unknown[]>();
  connectCalls = 0;
  unsubscribeCalls = 0;
  disconnectCalls = 0;

  connect(): Observable<unknown[]> {
    this.connectCalls++;
    return new Observable((subscriber) => {
      const subscription = this.rows.subscribe(subscriber);
      return () => {
        this.unsubscribeCalls++;
        subscription.unsubscribe();
      };
    });
  }

  disconnect(): void {
    this.disconnectCalls++;
  }
}

class SynchronousMobileDataSource extends DataSource<unknown> {
  readonly rows = new BehaviorSubject<unknown[]>([{ id: 1, name: 'Alice' }]);

  connect(): Observable<unknown[]> {
    return this.rows;
  }

  disconnect(): void {}
}

const nameColumn = {
  name: () => 'name',
  headerText: () => 'Name',
  sortInput: () => false,
  isActionColumnInput: () => false,
  mobileDataRenderer: (row: { name: string }) => row.name,
  ibCellDef: () => undefined,
} as unknown as IbColumn<unknown>;

const exportAction = {
  kind: () => 'export',
  templateRef: () => null,
} as unknown as IbKaiTableAction;

describe('IbKaiTableMobileComponent', () => {
  let fixture: ComponentFixture<IbKaiTableMobileComponent>;
  let component: IbKaiTableMobileComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IbKaiTableMobileComponent,
        IbDataExportModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
       providers: [{
         provide: OVERRIDE_EXPORT_FORMATS,
         useValue: [{ format: 'xlsx', label: 'XLSX', export: () => undefined }],
         multi: true,
       }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbKaiTableMobileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('columns', [nameColumn]);
    fixture.componentRef.setInput('displayedColumns', ['name']);
    fixture.componentRef.setInput('filters', []);
    fixture.componentRef.setInput('headerActions', []);
  });

  it('renders rows emitted by dataSource.connect()', fakeAsync(() => {
    const source = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', source);
    fixture.detectChanges();
    flushMicrotasks();

    source.rows.next([{ id: 1, name: 'Alice' }]);
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.data()).toEqual([{ id: 1, name: 'Alice' }]);
    expect(fixture.nativeElement.querySelectorAll('ib-kai-table-mobile-item').length).toBe(1);
  }));

  it('renders a synchronous BehaviorSubject initial value without NG0600', fakeAsync(() => {
    fixture.componentRef.setInput('dataSource', new SynchronousMobileDataSource());

    expect(() => fixture.detectChanges()).not.toThrow();
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.data()).toEqual([{ id: 1, name: 'Alice' }]);
    expect(fixture.nativeElement.querySelectorAll('ib-kai-table-mobile-item').length).toBe(1);
  }));

  it('clears rows before rendering emissions from a replacement data source', fakeAsync(() => {
    const first = new MobileDataSource();
    const second = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', first);
    fixture.detectChanges();
    flushMicrotasks();

    first.rows.next([{ id: 1, name: 'Alice' }]);
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.data()).toEqual([{ id: 1, name: 'Alice' }]);

    fixture.componentRef.setInput('dataSource', second);
    fixture.detectChanges();
    flushMicrotasks();

    expect(first.unsubscribeCalls).toBe(1);
    expect(first.disconnectCalls).toBe(1);
    expect(second.connectCalls).toBe(1);
    expect(component.data()).toEqual([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('ib-kai-table-mobile-item').length).toBe(0);

    second.rows.next([{ id: 2, name: 'Bob' }]);
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.data()).toEqual([{ id: 2, name: 'Bob' }]);
    expect(fixture.nativeElement.querySelectorAll('ib-kai-table-mobile-item').length).toBe(1);
  }));

  it('cleans up the data source when destroyed', fakeAsync(() => {
    const source = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', source);
    fixture.detectChanges();
    flushMicrotasks();

    fixture.destroy();

    expect(source.unsubscribeCalls).toBe(1);
    expect(source.disconnectCalls).toBe(1);
  }));

  it('defers data source emissions triggered from a computed', fakeAsync(() => {
    const source = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', source);
    fixture.detectChanges();
    flushMicrotasks();

    const triggerEmission = computed(() => {
      source.rows.next([{ id: 2, name: 'Bob' }]);
      return component.data();
    });

    expect(() => triggerEmission()).not.toThrow();
    flushMicrotasks();
    fixture.detectChanges();

    expect(component.data()).toEqual([{ id: 2, name: 'Bob' }]);
    expect(fixture.nativeElement.querySelectorAll('ib-kai-table-mobile-item').length).toBe(1);
  }));

  it('emits a Sort value object when sorting a column', () => {
    const emitted: unknown[] = [];
    component.sortUpdated.subscribe((sort) => emitted.push(sort));

    component.sortUpdate('name');

    expect(emitted).toEqual([{ active: 'name', direction: 'asc' }]);
  });

  it('does not add an ib-action column without actionColumn', () => {
    fixture.detectChanges();

    expect(component.cardActionColumns()).toEqual([]);
    expect(component.visibleColumns().map((column) => column.name())).toEqual(['name']);
  });

  describe('export capability gating', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('headerActions', [exportAction]);
    });

    it('renders the export button when canExportCurrentPage is true', () => {
      fixture.componentRef.setInput('canExportCurrentPage', true);
      fixture.componentRef.setInput('canExportAllRows', true);
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelectorAll('.ib-kai-table-mobile__toolbar-actions mat-icon');
      const exportIcon = Array.from(icons).find(
        (el: Element) => el.textContent?.trim() === 'file_download'
      );
      expect(exportIcon).toBeTruthy();
    });

    it('hides the export button when canExportCurrentPage is false', () => {
      fixture.componentRef.setInput('canExportCurrentPage', false);
      fixture.componentRef.setInput('canExportAllRows', false);
      fixture.detectChanges();

      const icons = fixture.nativeElement.querySelectorAll('.ib-kai-table-mobile__toolbar-actions mat-icon');
      const exportIcon = Array.from(icons).find(
        (el: Element) => el.textContent?.trim() === 'file_download'
      );
      expect(exportIcon).toBeUndefined();
    });

    it('renders all-only export and hides current-page and selected radios', async () => {
      fixture.componentRef.setInput('canExportAllRows', true);
      fixture.componentRef.setInput('canExportCurrentPage', false);
      fixture.detectChanges();

      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      expect(await loader.getAllHarnesses(
        MatButtonHarness.with({ ancestor: '.ib-kai-table-mobile__toolbar-actions' }),
      )).toHaveSize(1);

      const exportButton = await loader.getHarness(
        MatButtonHarness.with({ ancestor: '.ib-kai-table-mobile__toolbar-actions' }),
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      const values = await Promise.all(
        (await dialog.getAllHarnesses(MatRadioButtonHarness)).map((radio) => radio.getValue()),
      );

      expect(values).toEqual(['all']);
    });

    it('renders current-only export with only the current-page radio', async () => {
      fixture.componentRef.setInput('canExportAllRows', false);
      fixture.componentRef.setInput('canExportCurrentPage', true);
      fixture.detectChanges();

      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({ ancestor: '.ib-kai-table-mobile__toolbar-actions' }),
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      const values = await Promise.all(
        (await dialog.getAllHarnesses(MatRadioButtonHarness)).map((radio) => radio.getValue()),
      );

      expect(values).toEqual(['current']);
    });

    it('renders no export button when no export capability is enabled', async () => {
      fixture.componentRef.setInput('canExportAllRows', false);
      fixture.componentRef.setInput('canExportCurrentPage', false);
      fixture.detectChanges();

      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);

      expect(await loader.getAllHarnesses(
        MatButtonHarness.with({ ancestor: '.ib-kai-table-mobile__toolbar-actions' }),
      )).toHaveSize(0);
    });

    it('never offers selected-row export', async () => {
      fixture.componentRef.setInput('canExportAllRows', true);
      fixture.componentRef.setInput('canExportCurrentPage', true);
      fixture.detectChanges();

      const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
      const exportButton = await loader.getHarness(
        MatButtonHarness.with({ ancestor: '.ib-kai-table-mobile__toolbar-actions' }),
      );
      await exportButton.click();
      const dialog = await loader.getHarness(MatDialogHarness);
      const values = await Promise.all(
        (await dialog.getAllHarnesses(MatRadioButtonHarness)).map((radio) => radio.getValue()),
      );

      expect(values).not.toContain('selected');
    });

    it('invokes column headerText signal for labels', fakeAsync(() => {
      const source = new MobileDataSource();
      fixture.componentRef.setInput('dataSource', source);
      fixture.detectChanges();
      flushMicrotasks();

      source.rows.next([{ id: 1, name: 'Alice' }]);
      flushMicrotasks();
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.ib-kai-table-mobile__label');
      expect(label).toBeTruthy();
      expect(label.textContent.trim()).toBe('Name');
    }));
  });
});

@Component({
  template: `
    <ib-kai-table-mobile-item
      [row]="row"
      [cardDataColumns]="[]"
      [cardActionColumns]="[]"
      [rowGroup]="rowGroup"
    />
    <ng-template ibKaiRowGroup let-value>
      details: {{ value.name }}
    </ng-template>
  `,
  standalone: false,
})
class MobileItemHostComponent {
  row = { name: 'Alice' };

  @ViewChild(IbKaiRowGroupDirective, { static: true })
  rowGroup!: IbKaiRowGroupDirective;
}

describe('IbKaiTableMobileItemComponent', () => {
  let fixture: ComponentFixture<MobileItemHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MobileItemHostComponent, IbKaiRowGroupDirective],
      imports: [
        IbKaiTableMobileItemComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  }));

  it('preserves row-group context when details are expanded', () => {
    fixture = TestBed.createComponent(MobileItemHostComponent);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('.ib-kai-table-mobile__details-toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ib-kai-table-mobile__details').textContent)
      .toContain('details: Alice');
  });
});
