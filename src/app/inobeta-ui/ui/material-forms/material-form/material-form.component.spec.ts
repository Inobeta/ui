import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialFormComponent } from './material-form.component';
import { IbToolTestModule, translateServiceStub } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IbMaterialFormControlComponent, IbFormControlDirective } from '../material-form-control/material-form-control.component';
import { IbDynamicFormsModule, IbFormControlBase, IbFormControlService } from '../../forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IbMatTextboxControl, IbMatTextboxComponent } from '../controls/textbox';
import { IbMatCheckboxControl, IbMatCheckboxComponent } from '../controls/checkbox';
import { IbMatRadioControl, IbMatRadioComponent } from '../controls/radio';
import { IbMatDropdownControl, IbMatDropdownComponent } from '../controls/dropdown';
import { IbMatDatepickerComponent, IbMatAutocompleteComponent, IbMatLabelComponent,
  IbMatAutocompleteControl, IbMatLabelControl, IbMatTextareaControl, IbMatButtonControl,
  IbMatSlideToggleControl, IbMatSlideToggleComponent, IbMatDatepickerControl, ibMatDatepickerTranslate } from '..';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { IbMatTextareaComponent } from '../controls/textarea';
import { IbMatButtonComponent } from '../controls/button';
import { IbMatPaddingComponent, IbMatPaddingControl } from '../controls/padding';
import { TranslateService } from '@ngx-translate/core';
import { IbModalTestModule } from '../../modal';
import { IbMatDateAdapter } from '../intl/datepicker.intl';


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

  customFormFields: IbFormControlBase<any>[] = [
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
    new IbMatCheckboxControl({
      key: 'checked2',
      label: 'check this',
      value: true
    }),
    new IbMatSlideToggleControl({
      key: 'slide',
      label: 'check this',
    }),
    new IbMatSlideToggleControl({
      key: 'slide2',
      label: 'check this',
      value: true
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

    new IbMatPaddingControl({
      width: '50%'
    }),

    new IbMatTextareaControl({
      key: 'textarea',
      label: 'Enter long text',
      width: '100%'
    }),

    new IbMatDatepickerControl({
      type: 'date',
      key: 'dateFrom',
      width: '25%',
      label: 'Date from'
    }),
    new IbMatDatepickerControl({
      type: 'date2',
      key: 'dateFrom',
      width: '25%',
      label: 'Date from',
      value: '2021-01-01'
    }),

    new IbMatDatepickerControl({
      type: 'date3',
      key: 'dateFrom',
      width: '25%',
      label: 'Date from',
      value: new Date('2021-01-01')
    }),
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
        IbMatButtonComponent,
        IbMatPaddingComponent,
        IbMatSlideToggleComponent
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
        MatGridListModule,
        MatTooltipModule,
        MatSlideToggleModule,
        IbModalTestModule
      ],
      providers: [
        IbFormControlService,
        { provide: TranslateService, useValue: translateServiceStub},
        { provide: DateAdapter, useClass: IbMatDateAdapter },
        { provide: MAT_DATE_FORMATS, deps: [TranslateService], useFactory: ibMatDatepickerTranslate},
      ]
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
