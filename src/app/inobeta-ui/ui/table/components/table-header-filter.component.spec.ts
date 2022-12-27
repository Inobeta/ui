import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
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

  beforeEach(waitForAsync(() => {
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
