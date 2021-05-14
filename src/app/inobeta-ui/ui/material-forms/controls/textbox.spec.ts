import { async, TestBed } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTooltipModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatTextboxComponent } from './textbox';



describe('IbMatTextboxComponent', () => {
  let component: IbMatTextboxComponent;
  let formBuilder: FormBuilder;
  let control: FormControl;
  let form: FormGroup;

  beforeEach(async(() => {
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

    formBuilder = TestBed.get(FormBuilder);
    control = new FormControl('control');
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
