import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatCheckboxModule, MatMenuModule, MatSortModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, MatCardModule } from '@angular/material';
import { IbToolTestModule } from 'src/app/inobeta-ui/tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { IbTableHeaderFilterComponent } from './table-header-filter-component';
import { IbTableButtonComponent } from './table-button.component';
import { IbTableTitlesTypes } from '../models/titles.model';

@Component({
  selector: 'host-test',
  template: `
  <div
    ib-table-header-filter
    [ibTable]="table"
    [col]="t"
    [filter]="filter"
  >
  </div>


  `
})

export class TestHostComponent {
  table = {}
  t = {}
  filter = null
}




const initialState = {
  tableFiltersState: {
    tableFilters: {}
  }
};


let store: MockStore<{ tableFiltersState: any }>;

describe('IbTableHeaderFilterComponent', () => {
  let hostComponent: TestHostComponent;
  let component: IbTableHeaderFilterComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbTableHeaderFilterComponent,
        IbTableButtonComponent,
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
    component = fixture.debugElement.query(By.directive(IbTableHeaderFilterComponent)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should use numeric filters when empty', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(IbTableHeaderFilterComponent)).componentInstance;
    hostComponent.t = {
      type: IbTableTitlesTypes.NUMBER
    }
    fixture.detectChanges();
  });

  it('should use numeric filters when there are values', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(IbTableHeaderFilterComponent)).componentInstance;
    hostComponent.t = {
      type: IbTableTitlesTypes.NUMBER
    }
    hostComponent.filter = [
      { condition: '>', value: 6}
    ]
    fixture.detectChanges();
  });

});
