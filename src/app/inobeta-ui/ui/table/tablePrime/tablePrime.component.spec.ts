import {async, getTestBed, TestBed} from '@angular/core/testing';
import {components, imports} from '../../../../shared/rezonaShared.module';
import {APP_BASE_HREF} from '@angular/common';
import {TablePrimeComponent} from './tablePrime.component';
import {Component} from '@angular/core';
import {TableTitles, TableTitlesTypes} from '../titles.model';
import {SortableColumn} from './sortableColumn.model';
import {TranslateService} from '@ngx-translate/core';
import {TestUtilsModule} from '../../../../test/testUtils.module';
import {By} from '@angular/platform-browser';
import {UserStatus} from '../../../../shared/entities/user/user.model';

@Component({
  selector: 'rz-parent-test',
  template: `
    <ib-table-prime
      [items]="items"
      [titles]="titles"
      [filterValues]="filterValues"
      [currentSort]="currentSort"
      [rowsPerPage]="rowsPerPage"
      [paginator]="paginator"
    ></ib-table-prime>`
})
class ParentComponent {

  titles: TableTitles[] = [];
  items: any[] = [];
  filterValues: any = {};
  currentSort: SortableColumn = {};
  paginator: boolean;
  rowsPerPage: number;

}

describe('TablePrimeComponent', () => {

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [
        ParentComponent,
        ...components
      ],
      imports: [
        TestUtilsModule,
        ...imports
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'},
      ],
    }).compileComponents();

    let injector = getTestBed();
    let translate = injector.get(TranslateService);
    translate.use('it');
  }));


  // CREATION

  it('should create the component', async(() => {
    const fixture = TestBed.createComponent(TablePrimeComponent);
    const comp = fixture.debugElement.componentInstance;
    expect(comp).toBeTruthy();
  }));

  // INPUT

  it('should get titles input values', async(() => {
    let fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;
    parentComp.titles = [
      {key: 'code', value: 'Codice', type: TableTitlesTypes.BUTTON, filterable: true},
      {key: 'contact', value: 'Contatto', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'email', value: 'Email', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'type', value: 'Tipo', type: TableTitlesTypes.ANY, filterable: true},
      {
        key: 'status', value: 'Stato', type: TableTitlesTypes.COMBOBOX, filterable: true,
        comboOptions: [
          {label: 'Tutti', value: null},
          {label: 'Nuovo', value: UserStatus.NEW},
          {label: 'Attivo', value: UserStatus.ACTIVE},
          {label: 'Disattivo', value: UserStatus.ACTIVE}
        ]
      },
      {key: 'date', value: 'Data', type: TableTitlesTypes.DATE, filterable: true},
    ];
    fixture.detectChanges();
    const tableHeaders = fixture.debugElement.nativeElement.querySelector('#tableHeaders');
    let headersLabels = [], titlesValues = [];

    for (let key in parentComp.titles) {
      titlesValues.push(parentComp.titles[key].value);
    }

    for (let i = 0; i < tableHeaders.children.length; i++) {
      headersLabels.push(tableHeaders.children[i].textContent.trim());
    }

    expect(headersLabels).toEqual(titlesValues);
  }));

  it('should fill table rows through items input values', async(() => {
    let fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;

    parentComp.titles = [
      {key: 'code', value: 'Codice', type: TableTitlesTypes.BUTTON, filterable: true},
      {key: 'contact', value: 'Contatto', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'email', value: 'Email', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'type', value: 'Tipo', type: TableTitlesTypes.ANY, filterable: true},
      {
        key: 'status', value: 'Stato', type: TableTitlesTypes.COMBOBOX, filterable: true,
        comboOptions: [
          {label: 'Tutti', value: null},
          {label: 'Nuovo', value: UserStatus.NEW},
          {label: 'Attivo', value: UserStatus.ACTIVE},
          {label: 'Disattivo', value: UserStatus.ACTIVE}
        ]
      },
      {key: 'date', value: 'Data', type: TableTitlesTypes.DATE, filterable: true},
    ];
    parentComp.items = [
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC2',
        contact: 'Mario',
        email: 'mario@gmail.com',
        type: 'commerciale',
        status: UserStatus.ACTIVE,
        date: new Date('15 Jul 2018')
      },
      {
        code: 'ABC3',
        contact: 'Uccio',
        email: 'uccio@gmail.com',
        type: 'residenziale',
        status: UserStatus.ACTIVE,
        date: new Date('16 Jul 2018')
      }
    ];

    fixture.detectChanges();

    const tableRecordsDE = fixture.debugElement.queryAll(By.css('.tableRow'));
    let tableRecordsObjects: Object[] = [];
    for (let i = 0; i < tableRecordsDE.length; i++) {
      tableRecordsObjects.push(tableRecordsDE[i]['childNodes'][0]['context']['$implicit']);
    }
    expect(tableRecordsObjects).toEqual(parentComp.items);
  }));

  it('should get filters values from input', async(() => {
    let fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;

    parentComp.titles = [
      {key: 'code', value: 'Codice', type: TableTitlesTypes.BUTTON, filterable: true},
      {key: 'contact', value: 'Contatto', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'email', value: 'Email', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'type', value: 'Tipo', type: TableTitlesTypes.ANY, filterable: true},
      {
        key: 'status', value: 'Stato', type: TableTitlesTypes.COMBOBOX, filterable: true,
        comboOptions: [
          {label: 'Tutti', value: null},
          {label: 'Nuovo', value: UserStatus.NEW},
          {label: 'Attivo', value: UserStatus.ACTIVE},
          {label: 'Disattivo', value: UserStatus.ACTIVE}
        ]
      },
      {key: 'date', value: 'Data', type: TableTitlesTypes.DATE, filterable: true},
    ];
    parentComp.items = [
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC2',
        contact: 'Mario',
        email: 'mario@gmail.com',
        type: 'commerciale',
        status: UserStatus.ACTIVE,
        date: new Date('15 Jul 2018')
      },
      {
        code: 'ABC3',
        contact: 'Uccio',
        email: 'uccio@gmail.com',
        type: 'residenziale',
        status: UserStatus.ACTIVE,
        date: new Date('16 Jul 2018')
      }
    ];
    parentComp.filterValues = {
      code: {value: 'abcd', matchMode: 'contains'}
    };

    fixture.detectChanges();
    let tableRecordsDE = fixture.debugElement.queryAll(By.css('.tableRow'));
    expect(tableRecordsDE.length).toBe(0);
  }));

  it('should test "paginator" and "rowsPerPage" inputs', async(() => {
    let fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;

    parentComp.paginator = true;
    parentComp.rowsPerPage = 5;
    // Passing 6 objects in items input
    parentComp.items = [
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC2',
        contact: 'Mario',
        email: 'mario@gmail.com',
        type: 'commerciale',
        status: UserStatus.ACTIVE,
        date: new Date('15 Jul 2018')
      },
      {
        code: 'ABC3',
        contact: 'Uccio',
        email: 'uccio@gmail.com',
        type: 'residenziale',
        status: UserStatus.ACTIVE,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      }
    ];
    fixture.detectChanges();
    const tableRecords = fixture.debugElement.queryAll(By.css('.tableRow'));
    expect(tableRecords.length).toBe(parentComp.rowsPerPage);
  }));

  it('should sort table rows through items currentSort values', async(() => {
    let fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;
    parentComp.titles = [
      {key: 'code', value: 'Codice', type: TableTitlesTypes.BUTTON, filterable: true},
      {key: 'contact', value: 'Contatto', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'email', value: 'Email', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'type', value: 'Tipo', type: TableTitlesTypes.ANY, filterable: true},
      {
        key: 'status', value: 'Stato', type: TableTitlesTypes.COMBOBOX, filterable: true,
        comboOptions: [
          {label: 'Tutti', value: null},
          {label: 'Nuovo', value: UserStatus.NEW},
          {label: 'Attivo', value: UserStatus.ACTIVE},
          {label: 'Disattivo', value: UserStatus.ACTIVE}
        ]
      },
      {key: 'date', value: 'Data', type: TableTitlesTypes.DATE, filterable: true},
    ];
    parentComp.items = [
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC2',
        contact: 'Mario',
        email: 'mario@gmail.com',
        type: 'commerciale',
        status: UserStatus.ACTIVE,
        date: new Date('15 Jul 2018')
      },
      {
        code: 'ABC3',
        contact: 'Uccio',
        email: 'uccio@gmail.com',
        type: 'residenziale',
        status: UserStatus.ACTIVE,
        date: new Date('16 Jul 2018')
      }
    ];
    parentComp.currentSort = {
      field: 'code',
      order: SortableColumn.DESC
    };
    fixture.detectChanges();
    const tableRecordsDE = fixture.debugElement.queryAll(By.css('.tableRow'));
    let tableRecordsObjects: Object[] = [];
    for (let i = tableRecordsDE.length - 1; i >= 0; i--) {
      tableRecordsObjects.push(tableRecordsDE[i]['childNodes'][0]['context']['$implicit']);
    }
    expect(tableRecordsObjects).toEqual(parentComp.items.reverse());
  }));


  // OUTPUT

  it('should emit user code after clicking on his button', async(() => {
    const fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;
    const tableComp = fixture.debugElement.children[0].componentInstance;
    parentComp.titles = [
      {key: 'code', value: 'Codice', type: TableTitlesTypes.BUTTON, filterable: true},
      {key: 'contact', value: 'Contatto', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'email', value: 'Email', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'type', value: 'Tipo', type: TableTitlesTypes.ANY, filterable: true},
      {
        key: 'status', value: 'Stato', type: TableTitlesTypes.COMBOBOX, filterable: true,
        comboOptions: [
          {label: 'Tutti', value: null},
          {label: 'Nuovo', value: UserStatus.NEW},
          {label: 'Attivo', value: UserStatus.ACTIVE},
          {label: 'Disattivo', value: UserStatus.ACTIVE}
        ]
      },
      {key: 'date', value: 'Data', type: TableTitlesTypes.DATE, filterable: true},
    ];
    parentComp.items = [
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC2',
        contact: 'Mario',
        email: 'mario@gmail.com',
        type: 'commerciale',
        status: UserStatus.ACTIVE,
        date: new Date('15 Jul 2018')
      },
      {
        code: 'ABC3',
        contact: 'Uccio',
        email: 'uccio@gmail.com',
        type: 'residenziale',
        status: UserStatus.ACTIVE,
        date: new Date('16 Jul 2018')
      }
    ];
    fixture.detectChanges();
    const spy = spyOn(tableComp.onButtonClick, 'emit');
    const tableButton = fixture.debugElement.nativeElement.querySelectorAll('.tableButton');
    tableButton[0].click();
    expect(spy).toHaveBeenCalledWith('ABC1');
  }));

  it('should emit table row item on select', async( () => {
    const fixture = TestBed.createComponent(ParentComponent);
    const parentComp = fixture.debugElement.componentInstance;
    const tableComp = fixture.debugElement.children[0].componentInstance;
    parentComp.titles = [
      {key: 'code', value: 'Codice', type: TableTitlesTypes.BUTTON, filterable: true},
      {key: 'contact', value: 'Contatto', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'email', value: 'Email', type: TableTitlesTypes.ANY, filterable: true},
      {key: 'type', value: 'Tipo', type: TableTitlesTypes.ANY, filterable: true},
      {
        key: 'status', value: 'Stato', type: TableTitlesTypes.COMBOBOX, filterable: true,
        comboOptions: [
          {label: 'Tutti', value: null},
          {label: 'Nuovo', value: UserStatus.NEW},
          {label: 'Attivo', value: UserStatus.ACTIVE},
          {label: 'Disattivo', value: UserStatus.ACTIVE}
        ]
      },
      {key: 'date', value: 'Data', type: TableTitlesTypes.DATE, filterable: true},
    ];
    parentComp.items = [
      {
        code: 'ABC1',
        contact: 'Sandro',
        email: 'sandro@gmail.com',
        type: 'residenziale',
        status: UserStatus.NEW,
        date: new Date('16 Jul 2018')
      },
      {
        code: 'ABC2',
        contact: 'Mario',
        email: 'mario@gmail.com',
        type: 'commerciale',
        status: UserStatus.ACTIVE,
        date: new Date('15 Jul 2018')
      },
      {
        code: 'ABC3',
        contact: 'Uccio',
        email: 'uccio@gmail.com',
        type: 'residenziale',
        status: UserStatus.ACTIVE,
        date: new Date('16 Jul 2018')
      }
    ];
    fixture.detectChanges();
    const spy = spyOn(tableComp.onItemSelect, 'emit');
    tableComp.selectItem(parentComp.items[0]);
    expect(spy).toHaveBeenCalledWith(parentComp.items[0]);
  }));

});

