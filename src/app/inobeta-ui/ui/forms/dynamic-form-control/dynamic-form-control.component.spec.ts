import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IbDynamicFormControlComponent } from './dynamic-form-control.component';
import { IbFormControlService } from '..';
import { ReactiveFormsModule, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { IbFormControlBase } from '../controls/form-control-base';
import { IbTextbox } from '../controls/textbox';
import { CommonModule } from '@angular/common';

describe('IbDynamicFormControlComponent', () => {
  let component: IbDynamicFormControlComponent;
  let fixture: ComponentFixture<IbDynamicFormControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IbDynamicFormControlComponent ],
      providers: [IbFormControlService],
      imports: [CommonModule, ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbDynamicFormControlComponent);
    component = fixture.componentInstance;
    component.form = new UntypedFormGroup({
      test: new UntypedFormControl()
    });

    component.base = new IbTextbox({
      key: 'test'
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
