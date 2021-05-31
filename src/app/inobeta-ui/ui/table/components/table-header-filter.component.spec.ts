import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { IbToolTestModule } from 'src/app/inobeta-ui/tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
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

    store = TestBed.inject(MockStore);
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
