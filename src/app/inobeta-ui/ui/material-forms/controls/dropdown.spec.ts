import { async, TestBed } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatFormFieldModule, MatOptionModule, MatSelectModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import {  IbMatDropdownComponent } from '../controls/dropdown';



describe('IbMatDropdownComponent', () => {
  let component: IbMatDropdownComponent;

  beforeEach(async(() => {
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
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const componentRef = TestBed.createComponent(IbMatDropdownComponent);
    component = componentRef.componentInstance;
    component.data = {
      self: new FormControl(),
      base: {
        options: [
          { key: 'test1', value: 'value1' },
          { key: 'test2', value: 'value2' }
        ],
        multiple: true,
        change: () => {}
      },
      form: null,
      hasError: null,
      formControlErrors: null
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should select and deselect all', () => {
    const spy = spyOn(component.data.self, 'setValue').and.callThrough();
    component.selectAll()
    expect(spy).toHaveBeenCalledWith(['test1', 'test2'])
    spy.calls.reset();
    component.selectAll()
    expect(spy).toHaveBeenCalledWith([])
    spy.calls.reset();
  });



  it('should handle selection when multiple', () => {
    const spy = spyOn(component.data.base, 'change').and.callThrough();
    component.handleSelection({value: []})
    expect(spy).not.toHaveBeenCalled()
    spy.calls.reset();
    component.handleSelection({value: ['something']})
    expect(spy).toHaveBeenCalled()
    spy.calls.reset();
    component.data.base.multiple = false;
    component.handleSelection({value: []})
    expect(spy).toHaveBeenCalled()
    spy.calls.reset();
  });

});
