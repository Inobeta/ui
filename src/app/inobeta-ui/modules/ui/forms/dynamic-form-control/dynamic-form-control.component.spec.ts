import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbDynamicFormControlComponent } from './dynamic-form-control.component';
import { IbFormControlService } from '..';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { IbFormControlBase } from '../controls/form-control-base';
import { IbTextbox } from '../controls/textbox';
import { CommonModule } from '@angular/common';

describe('IbDynamicFormControlComponent', () => {
  let component: IbDynamicFormControlComponent;
  let fixture: ComponentFixture<IbDynamicFormControlComponent>;

  beforeEach(async(() => {
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
    component.form = new FormGroup({
      test: new FormControl()
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
