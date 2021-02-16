import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialFormComponent } from './material-form.component';
import { IbToolTestModule } from '../../../tools';
import { CustomMaterialModule } from 'src/app/inobeta-ui/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialFormControlComponent } from '../material-form-control/material-form-control.component';
import { DynamicFormsModule } from '../../forms';


describe('CustomMaterialFormComponent', () => {
  let component: MaterialFormComponent;
  let fixture: ComponentFixture<MaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialFormComponent, MaterialFormControlComponent ],
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
    fixture = TestBed.createComponent(MaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
