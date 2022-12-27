import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatTextboxComponent } from './textbox';



describe('IbMatTextboxComponent', () => {
  let component: IbMatTextboxComponent;
  let formBuilder: UntypedFormBuilder;
  let control: UntypedFormControl;
  let form: UntypedFormGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbMatTextboxComponent,
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
        MatInputModule,
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
    const componentRef = TestBed.createComponent(IbMatTextboxComponent);
    component = componentRef.componentInstance;
    component.data = {
      self: control,
      base: {
        key: 'control',
        label: 'control',
        width: '33.3%',
        validators: []
      },
      form,
      hasError: null,
      formControlErrors: null
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should validate by min and max', () => {
    expect(component.minValidator).toBe(null);
    expect(component.maxValidator).toBe(null);
    component.data.base.validators = [Validators.min(1)];
    expect(component.minValidator).toBe(1);
    expect(component.maxValidator).toBe(null);
    component.data.base.validators = [Validators.max(2)];
    expect(component.minValidator).toBe(null);
    expect(component.maxValidator).toBe(2);
  });


  it('should returns hint', () => {
    component.data.base.hintMessage = null;
    expect(component.hintMessage).toBe(null);

    component.data.base.hintMessage = () => 'pippo';
    expect(component.hintMessage).toBe('pippo');
  });

});
