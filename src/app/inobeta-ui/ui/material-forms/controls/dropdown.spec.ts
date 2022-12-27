import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import {  IbMatDropdownComponent } from '../controls/dropdown';



describe('IbMatDropdownComponent', () => {
  let component: IbMatDropdownComponent;
  let formBuilder: UntypedFormBuilder;
  let control: UntypedFormControl;
  let form: UntypedFormGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbMatDropdownComponent,
      ],
      imports: [
        IbToolTestModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IbDynamicFormsModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        NoopAnimationsModule,
        FlexLayoutModule,
        MatIconModule,
        MatTooltipModule
      ]
    })
    .compileComponents();
    formBuilder = TestBed.inject(UntypedFormBuilder);
    control = new UntypedFormControl('control');
    form = formBuilder.group(control);
  }));

  beforeEach(() => {
    const componentRef = TestBed.createComponent(IbMatDropdownComponent);
    component = componentRef.componentInstance;
    component.data = {
      self: control,
      base: {
        options: [
          { key: 'test1', value: 'value1' },
          { key: 'test2', value: 'value2' }
        ],
        multiple: true,
        change: () => {}
      },
      form,
      hasError: null,
      formControlErrors: null
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should select and deselect all', () => {
    const spy = spyOn(component.data.self, 'setValue').and.callThrough();
    component.selectAll();
    expect(spy).toHaveBeenCalledWith(['test1', 'test2']);
    spy.calls.reset();
    component.selectAll();
    expect(spy).toHaveBeenCalledWith([]);
    spy.calls.reset();
  });



  it('should handle selection when multiple', () => {
    const spy = spyOn(component.data.base, 'change').and.callThrough();
    component.handleSelection({value: []});
    expect(spy).toHaveBeenCalled();
    spy.calls.reset();
    component.handleSelection({value: ['something']});
    expect(spy).toHaveBeenCalled();
    spy.calls.reset();
    component.data.base.multiple = false;
    component.handleSelection({value: []});
    expect(spy).toHaveBeenCalled();
    spy.calls.reset();
    control.setValue(['test1', 'test2']);
    component.handleSelection({value: ['test1', 'test2']});
  });

});
