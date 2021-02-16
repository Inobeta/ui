import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialFormControlComponent } from './material-form-control.component';
import { IbToolTestModule } from '../../../tools';
import { CustomMaterialModule } from 'src/app/inobeta-ui/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormsModule } from '../../forms';

xdescribe('MaterialFormControlComponent', () => {
  let component: MaterialFormControlComponent;
  let fixture: ComponentFixture<MaterialFormControlComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialFormControlComponent ],
      imports: [
        IbToolTestModule,
        CustomMaterialModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DynamicFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
