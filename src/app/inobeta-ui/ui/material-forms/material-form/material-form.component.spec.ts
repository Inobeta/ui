import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialFormComponent } from './material-form.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IbMaterialFormControlComponent, IbFormControlDirective } from '../material-form-control/material-form-control.component';
import { IbDynamicFormsModule, IbFormControlBase, IbFormControlService } from '../../forms';
import { MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatAutocompleteModule, MatIconModule } from '@angular/material';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatTextboxControl, IbMatTextboxComponent } from '../controls/textbox';
import { IbMatCheckboxControl, IbMatCheckboxComponent } from '../controls/checkbox';
import { IbMatRadioControl, IbMatRadioComponent } from '../controls/radio';
import { IbMatDropdownControl, IbMatDropdownComponent } from '../controls/dropdown';
import { IbMatDatepickerComponent, IbMatAutocompleteComponent, IbMatLabelComponent, IbMatDatepickerControl, IbMatAutocompleteControl, IbMatLabelControl, IbMatTextareaControl, IbMatButtonControl } from '..';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IbMatTextareaComponent } from '../controls/textarea';
import { IbMatButtonComponent } from '../controls/button';


@Component({
  selector: 'host-test',
  template: `
  <ib-material-form #customForm [actions]="customFormActions" [fields]="customFormFields" (ibSubmit)="onSubmit($event)"></ib-material-form>
  `
})

export class TestHostComponent {
  customFormActions = [

    new IbMatButtonControl({
      key: 'submit',
      label: 'Search'
    }),
    new IbMatButtonControl({
      key: 'clear',
      label: 'Clear',
      color: 'accent',
      handler: (form) => form.reset()
    })
  ];

  customFormFields: IbFormControlBase<string>[] = [
    new IbMatTextboxControl({
      key: 'firstName',
      label: 'First name',
      required: true,
      validators: [Validators.minLength(3)],
      errors: [{
        condition: (c) => c.hasError('required'),
        message: 'Email richiesta'
      }]
    }),
    new IbMatTextboxControl({
      type: 'email',
      key: 'email',
      label: 'Email',
      required: true,
      validators: [Validators.email]
    }),
    new IbMatTextboxControl({
      type: 'date',
      key: 'dateTime',
      label: 'Date',
      required: true,
    }),
    new IbMatDropdownControl({
      key: 'options',
      label: 'Options',
      options: [
        { key: 'test', value: 'value' }
      ]
    }),
    new IbMatDropdownControl({
      key: 'optionsMultiple',
      label: 'Options Multiple',
      width: '33.3%',
      multiple: true,
      options: [
        { key: 'test1', value: 'value1' },
        { key: 'test2', value: 'value2' },
        { key: 'test3', value: 'value3' },
        { key: 'test4', value: 'value4' }
      ],
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatRadioControl({
      key: 'food',
      value: 'test-1',
      label: 'Scegli qualcosa',
      options: [
        { key: 'test-1', value: 'Lasagne' },
        { key: 'test-2', value: 'Maccheroni' },
      ],
      required: true
    }),
    new IbMatCheckboxControl({
      key: 'checked',
      label: 'check this',
    }),
    new IbMatAutocompleteControl({
      key: 'autocomplete',
      label: 'Autocomplete',
      width: '33.3%',
      options: [
        { value: 'value1' },
        { value: 'value2' },
        { value: 'value3' },
        { value: 'value4' }
      ],
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatLabelControl({
      value: 'Static value',
      label: 'Static label',
      width: '50%'
    }),

    new IbMatTextareaControl({
      key: 'textarea',
      label: 'Enter long text',
      width: '100%'
    })
  ];

  onSubmit() {}
}



describe('IbMaterialFormComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: IbMaterialFormComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IbMaterialFormComponent,
        IbMaterialFormControlComponent,
        IbFormControlDirective,
        TestHostComponent,
        IbMatTextboxComponent,
        IbMatDropdownComponent,
        IbMatRadioComponent,
        IbMatCheckboxComponent,
        IbMatDatepickerComponent,
        IbMatAutocompleteComponent,
        IbMatLabelComponent,
        IbMatTextareaComponent,
        IbMatButtonComponent
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
        MatRadioModule,
        MatCheckboxModule,
        MatInputModule,
        MatButtonModule,
        NoopAnimationsModule,
        FlexLayoutModule,
        MatDatepickerModule,
        MatAutocompleteModule,
        MatIconModule,
      ],
      providers: [
        IbFormControlService
      ]
    })
    .overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
        IbMatTextboxComponent,
        IbMatDropdownComponent,
        IbMatRadioComponent,
        IbMatCheckboxComponent,
        IbMatDatepickerComponent,
        IbMatAutocompleteComponent,
        IbMatLabelComponent,
        IbMatTextareaComponent,
        IbMatButtonComponent
        ],
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(IbMaterialFormComponent)).componentInstance;
    fixture.detectChanges();
    hostComponent.customFormFields = [
      ...hostComponent.customFormFields,
      new IbMatTextboxControl({
        type: 'email',
        key: 'email2',
        label: 'Email2',
        required: true,
        validators: [Validators.email]
      })
    ];
    fixture.detectChanges();

    component.onSubmit();
    component.handleActionClick({
      key: 'submit',
      label: 'submit',
      handler: () => {}
    });
    component.handleActionClick({
      key: 'another',
      label: 'another',
      handler: () => {}
    });
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });
});
