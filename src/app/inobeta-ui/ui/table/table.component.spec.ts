import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatCheckboxModule, MatMenuModule, MatSortModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, MatCardModule } from '@angular/material';
import { IbToolTestModule } from 'src/app/inobeta-ui/tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbTableComponent } from './table.component';
import { IbTableHeaderComponent } from './components/table-header/table-header.component';
import { IbTableRowsComponent } from './components/table-rows/table-rows.component';
import { IbTableAddComponent } from './components/table-add.component';
import { IbTableExportComponent, IbTableHeaderPopupComponent, IbTableExportDialogComponent, IbTableTitlesTypes } from '.';
import { IbTableFilterResetComponent } from './components/table-filter-reset.component';
import { IbTableMenuActionsComponent } from './components/table-menu-actions.component';
import { IbTablePaginatorComponent } from './components/table-paginator.component';
import { IbTableSeachComponent } from './components/table-seach.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Component, OnInit } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';

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
  [pdfCustomStyles]="pdfCustomStyles"
  [pdfSetup]="pdfSetup"
  [hasExport]="true"
  [customItemTemplate]="{ lot: lotTemplate }"
  [selectableRows]="true"
  (rowChecked)="prova2($event)"
  [titles]="titles"
  [items]="items"
  [enableReduxStore]="enableReduxStore"
  [tableName]="'pippo'"
  [selectRowName]="'Ricevuto'"
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
  [actions]="['test']"
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
      key: 'date',
      value: 'receiptGoods.historyGoods.table.date',
      type: IbTableTitlesTypes.STRING,
      filterable: true,
      width: '10%'
    },
    {
      key: 'userType',
      value: 'Tipo Utente',
      type: IbTableTitlesTypes.MATERIAL_SELECT,
      width: '10%',
      materialSelectItems: [
        {
          value: 1,
          label: 'Op Lavoraz.'
        },
        {
          value: 3,
          label: 'Super Admin'
        }
      ]
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
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5,
      qt2: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6,
      qt2: 5
    }
  ];

  pdfCustomStyles = {
    headStyles: { fillColor: [232, 202, 232] },
    columnStyles: { sender: { halign: 'center' }},
  };

  pdfSetup = {
    orientation: 'p'
  }
  constructor() { }


  stampa(item) {
    console.log(item);
  }

  ngOnInit(): void { }

  prova2($event: any) {
    console.log($event);
  }
}




const initialState = {
  tableFiltersState: {
    tableFilters: {}
  }
};


let store: MockStore<{ tableFiltersState: any }>;

describe('IbTableComponent', () => {
  let hostComponent: TestHostComponent;
  let component: IbTableComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbTableComponent,
        IbTableHeaderComponent,
        IbTableRowsComponent,
        IbTableAddComponent,
        IbTableExportComponent,
        IbTableFilterResetComponent,
        IbTableMenuActionsComponent,
        IbTablePaginatorComponent,
        IbTableSeachComponent,
        IbTableHeaderPopupComponent,
        IbTableExportDialogComponent,
        TestHostComponent
       ],
       providers: [
        provideMockStore({ initialState }),
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
        NoopAnimationsModule
      ]
    })
    .compileComponents();

    store = TestBed.get<Store<any>>(Store);
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
    })

    component.export({
      format: 'pdf',
      dataset: null
    })

    component.export({
      format: 'xlsx',
      dataset: null
    })


    component.export({
      format: 'csv',
      dataset: 'all'
    })
  });


  it('should create from store', () => {
    hostComponent.enableReduxStore = true;
    store.setState({
      tableFiltersState: {
        tableFilters: {}
      }
    })
    fixture.detectChanges();
    expect(component).toBeTruthy();


    store.setState({
      tableFiltersState: {
        tableFilters: {
          'pippo': {
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
    })
    fixture.detectChanges();
    expect(component).toBeTruthy();


    store.setState({
      tableFiltersState: {
        tableFilters: {
          'pippo': {
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
    })
    fixture.detectChanges();
    expect(component).toBeTruthy();

  });

  it('should sort', () => {
    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true)

    component.columnFilter = {
      'qt2': 5
    }

    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true)


    component.columnFilter = {
      'qt2': 6
    }

    component.sortData({
      active: 'qt2',
      direction: 'asc'
    }, true)


    component.columnFilter = {
      'qt': 5
    }

    component.sortData({
      active: 'qt',
      direction: 'asc'
    }, true)

    component.resetFilters();
  });

});
