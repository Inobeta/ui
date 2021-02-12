import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRowsComponent } from './table-rows.component';
import { MatCheckboxModule } from '@angular/material';
import { IbToolTestModule } from 'src/app/inobeta-ui/modules/tools';
import { CustomMaterialModule } from 'src/app/inobeta-ui/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('TableRowsComponent', () => {
  let component: TableRowsComponent;
  let fixture: ComponentFixture<TableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableRowsComponent ],
      imports: [
        IbToolTestModule,
        CustomMaterialModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
