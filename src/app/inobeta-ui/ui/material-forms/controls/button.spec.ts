import { TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IbMatButtonComponent } from './button';
import { IbModalTestModule } from '../../modal/modal-test.module';
import { TranslateModule } from "@ngx-translate/core";



describe('IbMatButtonComponent', () => {
  let component: IbMatButtonComponent;
  let formBuilder: UntypedFormBuilder;
  let control: UntypedFormControl;
  let form: UntypedFormGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbMatButtonComponent,
      ],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IbDynamicFormsModule,
        MatFormFieldModule,
        NoopAnimationsModule,
        MatButtonModule,
        IbModalTestModule,
        TranslateModule.forRoot({
          extend: true,
        }),
      ]
    })
    .compileComponents();

    formBuilder = TestBed.inject(UntypedFormBuilder);
    control = new UntypedFormControl('control');
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
