import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormControlComponent } from './dynamic-form-control.component';
import { FormControlService } from '..';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { FormControlBase } from '../controls/form-control-base';
import { Textbox } from '../controls/textbox';
import { CommonModule } from '@angular/common';

describe('DynamicFormControlComponent', () => {
  let component: DynamicFormControlComponent;
  let fixture: ComponentFixture<DynamicFormControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicFormControlComponent ],
      providers: [FormControlService],
      imports: [CommonModule, ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicFormControlComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      test: new FormControl()
    });

    component.base = new Textbox({
      key: 'test'
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
