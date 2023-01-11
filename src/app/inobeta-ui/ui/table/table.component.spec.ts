import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { IbToolTestModule } from 'src/app/inobeta-ui/tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbTableComponent } from './table.component';
import { IbTableHeaderComponent } from './components/table-header/table-header.component';
import {
  IbTableExportComponent, IbTableHeaderPopupComponent,
  IbTableExportDialogComponent, IbTableTitlesTypes, ibMatPaginatorTranslate
} from '.';
import { IbTablePaginatorComponent } from './components/table-paginator.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Component, OnInit } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IbTableHeaderFilterComponent } from './components/table-header-filter-component';
import { IbTableButtonComponent } from './components/table-button.component';
import { IbTableActionsComponent } from './components/table-actions.component';
import { IbTableRowComponent } from './components/table-row.component';
import { IbModalTestModule } from '../modal';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ibTableFeatureInitialState } from './store/reducers/table.reducer';
import { RouterTestingModule } from '@angular/router/testing';
import { IbTableConfigModule } from './components/table-conf/table-config.module';
import { TotalRowModule } from './components/table-total-row/total-row.module';
import { IbStickyAreaModule } from './directives/sticky-area/sticky-area.module';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'host-test',
  template: `
  <ng-template #deleteTemplate let-item="item">
  <span class="delete-button">
      <i class="material-icons">search</i>
  </span>
</ng-template>

<ng-template #headerClickTemplate let-ibTable="ibTable" let-col="col">
  <ib-table-header-popup
    [ibTable]="ibTable"
    [col]="col">
  </ib-table-header-popup>
</ng-template>


<ng-template #exportTemplate let-ibTable="ibTable" let-col="col">
  <!--example component customization-->
  Clicca per esportare:&nbsp;
  <ib-table-export
    (export)="ibTable.export($event || {})"
    >
  </ib-table-export>
</ng-template>

<ib-table
  tableName="table_for_tests"
  [pdfCustomStyles]="pdfCustomStyles"
  [pdfSetup]="pdfSetup"
  [hasExport]="true"
  [customItemTemplate]="{ lot: lotTemplate }"
  [selectableRows]="true"
  (rowChecked)="prova2($event)"
  [titles]="titles"
  [items]="items"
  [enableReduxStore]="enableReduxStore"
  [templateButtons]="[{
    template: deleteTemplate,
    columnName: 'Elimina'
  }]"
  [templateHeaders]="{
    'lot': headerClickTemplate,
    'sender': headerClickTemplate,
    'date': headerClickTemplate,
    'qt': headerClickTemplate
  }"
  [structureTemplates]="{
    'exportTemplate': exportTemplate
  }"

  >
  <ng-template #lotTemplate let-item="item">
    <div style="font-weight: bold; color: red;">{{item.lot}}</div>
  </ng-template>
</ib-table>


  `
})

export class TestHostComponent {
  enableReduxStore = false;
  titles = [
    {
      key: 'lot',
      value: 'Lotto',
      type: IbTableTitlesTypes.CUSTOM,
      filterable: true,
      width: '10%',
    },
    {
      key: 'sender',
      value: 'Mittente',
      type: IbTableTitlesTypes.STRING,
      filterable: true
    },
    {
      key: 'article',
      value: 'Articolo',
      type: IbTableTitlesTypes.ANY,
      filterable: true
    },
    {
      key: 'date',
      value: 'receiptGoods.historyGoods.table.date',
      type: IbTableTitlesTypes.DATE,
      filterable: true,
      width: '10%'
    },
    {
      key: 'active',
      value: 'Active',
      type: IbTableTitlesTypes.BOOLEAN,
      filterable: true,
      width: '10%'
    },
    {
      key: 'qt',
      value: 'Qt',
      type: IbTableTitlesTypes.INPUT_NUMBER,
      filterable: true,
      placeHolderInput: 'Inserisci qt'
    },
    {
      key: 'qt2',
      value: 'Qt',
      type: IbTableTitlesTypes.NUMBER,
      filterable: true,
      placeHolderInput: 'qt'
    }
  ];
  items = [
    {
      lot: 17,
      date: '2019-05-15',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      active: true,
      qt: 5,
      qt2: 5
    },
    {
      lot: 2,
      date: '2020-04-11',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      active: false,
      qt: 6,
      qt2: 5
    }
  ];

  pdfCustomStyles = {
    headStyles: { fillColor: [232, 202, 232] },
    columnStyles: { sender: { halign: 'center' } },
  };

  pdfSetup = {
    orientation: 'p'
  };
  constructor() { }


  stampa(item) {
    console.log(item);
  }

  ngOnInit(): void { }

  prova2($event: any) {
    console.log($event);
  }
}




const mockedInitialState = {
  tableFiltersState: {
    tableFilters: {}
  },
  ...ibTableFeatureInitialState
};


let store: MockStore<{ tableFiltersState: any }>;

describe('IbTableComponent', () => {
  let hostComponent: TestHostComponent;
  let component: IbTableComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  let mockedTotalRowSelector;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbTableComponent,
        IbTableHeaderComponent,
        IbTableExportComponent,
        IbTablePaginatorComponent,
        IbTableHeaderPopupComponent,
        IbTableExportDialogComponent,
        IbTableRowComponent,
        IbTableActionsComponent,
        IbTableButtonComponent,
        IbTableHeaderFilterComponent,
        TestHostComponent
      ],
      providers: [
        provideMockStore({ initialState: mockedInitialState }),
        {
          provide: MatPaginatorIntl, deps: [TranslateService],
          useFactory: ibMatPaginatorTranslate
        },
        TranslateService
      ],
      imports: [
        IbToolTestModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatSortModule,
        MatChipsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDialogModule,
        MatSelectModule,
        MatRadioModule,
        MatPaginatorModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCardModule,
        NoopAnimationsModule,
        IbModalTestModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        }),
        IbStickyAreaModule,
        TotalRowModule,
        IbTableConfigModule,
        OverlayModule
      ]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    mockedTotalRowSelector = store.overrideSelector(('test'), []);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(IbTableComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });


  it('should do export', () => {
    component.export({
      format: 'csv',
      dataset: null
    });

    component.export({
      format: 'pdf',
      dataset: null
    });

    component.export({
      format: 'xlsx',
      dataset: null
    });


    component.export({
      format: 'csv',
      dataset: 'all'
    });
  });


  it('should create from store', () => {
    hostComponent.enableReduxStore = true;
    store.setState({
      tableFiltersState: {
        tableFilters: {}
      }
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();


    store.setState({
      tableFiltersState: {
        tableFilters: {
          default_table_name: {
            paginatorFilters: {
              previousPageIndex: 0,
              pageIndex: 0,
              pageSize: 10,
              lengthP: 30
            },
            sortType: {
              active: 'qt',
              direction: 'asc'
            },
            date: {
              value: null
            },
            sender: {
              value: 'cesena'
            }
          }
        }
      }
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();


    store.setState({
      tableFiltersState: {
        tableFilters: {
          default_table_name: {
            paginatorFilters: null,
            sortType: {
              active: 'qt2',
              direction: 'asc'
            },
            date: {
              value: null
            },
            sender: {
              value: 'cesena'
            }
          }
        }
      }
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();

  });

  it('should sort', () => {
    component.columnFilter = {};

    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true);

    component.columnFilter = {
      article: 'test'
    };

    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true);



    component.columnFilter = {
      qt2: [{ condition: '>', value: 5 }]
    };

    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true);


    component.columnFilter = {
      qt2: [{ condition: '<', value: 6 }]
    };

    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true);


    component.columnFilter = {
      qt: [{ condition: '>', value: 5 }]
    };

    component.sortData({
      active: 'qt',
      direction: 'asc'
    }, true);


    component.columnFilter = {
      date: [{ condition: '>', value: '2020-05-01' }]
    };

    component.sortData({
      active: 'qt',
      direction: 'asc'
    }, true);
    component.columnFilter = {
      active: true
    };

    component.sortData({
      active: 'qt',
      direction: 'asc'
    }, true);

    component.resetFilters();
  });

  it('should manual set filter', () => {
    component.columnFilter = {};
    component.setFilter('article', 'test', 0, true)
    expect(component.columnFilter).not.toEqual({})
    component.resetFilters();
    component.setFilter('article', 'test', 0, true, 'pippo')
    expect(component.columnFilter).not.toEqual({})
  });

  it('should read form data', () => {
    component.isValidForm()
    component.getFormValues()
    component.getFormValues('selected')
  });

});
