import { async, TestBed } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatButtonModule, MatFormFieldModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatButtonComponent } from './button';



describe('IbMatButtonComponent', () => {
  let component: IbMatButtonComponent;
  let formBuilder: FormBuilder;
  let control: FormControl;
  let form: FormGroup;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbMatButtonComponent,
      ],
      imports: [
        IbToolTestModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IbDynamicFormsModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        FlexLayoutModule,
        MatButtonModule
      ]
    })
    .compileComponents();

    formBuilder = TestBed.get(FormBuilder);
    control = new FormControl('control');
    form = formBuilder.group(control);
  }));

  beforeEach(() => {
    const componentRef = TestBed.createComponent(IbMatButtonComponent);
    component = componentRef.componentInstance;
    component.data = {
      self: control,
      base: {
        key: 'submit',
        label: 'control',
        width: '33.3%',
        handler: () => {}
      },
      form,
      hasError: null,
      formControlErrors: null
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should search', () => {
    const spyHandler = spyOn(component.data.base, 'handler').and.callFake(() => {});
    component.handleActionClick();
    expect(spyHandler).not.toHaveBeenCalled();
    component.data.base.key = 'other';
    component.handleActionClick();
    expect(spyHandler).toHaveBeenCalledWith(form);
  });

});
