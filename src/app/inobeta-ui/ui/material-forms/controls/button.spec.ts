import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatButtonComponent } from './button';
import { IbModalTestModule } from '../../modal/modal-test.module';



describe('IbMatButtonComponent', () => {
  let component: IbMatButtonComponent;
  let formBuilder: FormBuilder;
  let control: FormControl;
  let form: FormGroup;

  beforeEach(waitForAsync(() => {
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
        MatButtonModule,
        IbModalTestModule
      ]
    })
    .compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
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
