import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbTableHeaderComponent } from './table-header.component';
import { IbToolTestModule } from 'public_api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatSortModule, MatChipsModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, MatCardModule } from '@angular/material';

describe('IbTableHeaderComponent', () => {
  let component: IbTableHeaderComponent;
  let fixture: ComponentFixture<IbTableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbTableHeaderComponent ],
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
        MatCardModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbTableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
