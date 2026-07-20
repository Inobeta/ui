import { DataSource } from '@angular/cdk/collections';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { IbColumn } from '../kai-table/columns/column';
import { IbKaiRowGroupDirective } from '../kai-table/rowgroup';
import { IbKaiTableMobileComponent } from './table-mobile.component';
import { IbKaiTableMobileItemComponent } from './table-mobile-item.component';

class MobileDataSource extends DataSource<unknown> {
  readonly rows = new Subject<unknown[]>();
  connectCalls = 0;
  unsubscribeCalls = 0;

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

  disconnect(): void {}
}

const nameColumn = {
  name: () => 'name',
  headerText: 'Name',
  sortInput: () => false,
  isActionColumnInput: () => false,
  mobileDataRenderer: (row: { name: string }) => row.name,
  ibCellDef: () => undefined,
} as unknown as IbColumn<unknown>;

describe('IbKaiTableMobileComponent', () => {
  let fixture: ComponentFixture<IbKaiTableMobileComponent>;
  let component: IbKaiTableMobileComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        IbKaiTableMobileComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
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

  it('renders rows emitted by dataSource.connect()', () => {
    const source = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', source);
    fixture.detectChanges();

    source.rows.next([{ id: 1, name: 'Alice' }]);
    fixture.detectChanges();

    expect(component.data()).toEqual([{ id: 1, name: 'Alice' }]);
    expect(fixture.nativeElement.querySelectorAll('ib-kai-table-mobile-item').length).toBe(1);
  });

  it('replaces the data source and unsubscribes the previous connection', () => {
    const first = new MobileDataSource();
    const second = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', first);
    fixture.detectChanges();

    fixture.componentRef.setInput('dataSource', second);
    fixture.detectChanges();

    expect(first.unsubscribeCalls).toBe(1);
    expect(second.connectCalls).toBe(1);
  });

  it('unsubscribes the data source when destroyed', () => {
    const source = new MobileDataSource();
    fixture.componentRef.setInput('dataSource', source);
    fixture.detectChanges();

    fixture.destroy();

    expect(source.unsubscribeCalls).toBe(1);
  });

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
