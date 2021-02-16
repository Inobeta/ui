import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableHeaderComponent } from './table-header.component';
import { IbToolTestModule } from 'public_api';
import { CustomMaterialModule } from 'src/app/inobeta-ui/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('TableHeaderComponent', () => {
  let component: TableHeaderComponent;
  let fixture: ComponentFixture<TableHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableHeaderComponent ],
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
    fixture = TestBed.createComponent(TableHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
