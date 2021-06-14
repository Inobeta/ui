import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatAutocompleteComponent } from './autocomplete';



describe('IbMatAutocompleteComponent', () => {
  let component: IbMatAutocompleteComponent;
  let formBuilder: FormBuilder;
  let control: FormControl;
  let form: FormGroup;

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

    formBuilder = TestBed.inject(FormBuilder);
    control = new FormControl('control');
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
