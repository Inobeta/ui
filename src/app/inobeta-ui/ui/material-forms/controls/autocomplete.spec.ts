import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatAutocompleteComponent } from './autocomplete';



describe('IbMatAutocompleteComponent', () => {
  let component: IbMatAutocompleteComponent;
  let formBuilder: UntypedFormBuilder;
  let control: UntypedFormControl;
  let form: UntypedFormGroup;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbMatAutocompleteComponent,
      ],
      imports: [
        IbToolTestModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IbDynamicFormsModule,
        MatFormFieldModule,
        MatOptionModule,
        MatAutocompleteModule,
        NoopAnimationsModule,
        FlexLayoutModule,
        MatIconModule
      ]
    })
    .compileComponents();

    formBuilder = TestBed.inject(UntypedFormBuilder);
    control = new UntypedFormControl('control');
    form = formBuilder.group(control);
  }));

  beforeEach(() => {
    const componentRef = TestBed.createComponent(IbMatAutocompleteComponent);
    component = componentRef.componentInstance;
    component.data = {
      self: control,
      base: {
        key: 'control',
        label: 'control',
        width: '33.3%',
        options: [
          { value: 'value1' },
          { value: 'value2' },
          { value: 'value3' },
          { value: 'value4' }
        ]
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
    component.onSearchChange('1', component.data.base.options);
    expect(component.autocompleteFiltered.length).toBe(1);
  });

});
