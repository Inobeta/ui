import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IbFormControlBase } from 'src/app/inobeta-ui/ui/forms/controls/form-control-base';
import { IbTextbox } from 'src/app/inobeta-ui/ui/forms/controls/textbox';
import { Validators } from '@angular/forms';
import { IbMaterialFormComponent } from 'src/app/inobeta-ui/ui/material-forms/material-form/material-form.component';
import { MyCustomTextbox, MyCustomTextboxParams } from './my-custom-textbox.model';
import { IbMatTextboxControl } from 'src/app/inobeta-ui/ui/material-forms/controls/textbox';
import { IbMatDropdownControl } from 'src/app/inobeta-ui/ui/material-forms/controls/dropdown';
import { IbMatRadioControl } from 'src/app/inobeta-ui/ui/material-forms/controls/radio';
import { IbMatCheckboxControl } from 'src/app/inobeta-ui/ui/material-forms/controls/checkbox';
import { IbMatDatepickerControl } from 'src/app/inobeta-ui/ui/material-forms/controls/datepicker';
import { IbMatAutocompleteControl } from 'src/app/inobeta-ui/ui/material-forms/controls/autocomplete';
import { IbMatLabelControl } from 'src/app/inobeta-ui/ui/material-forms/controls/label';
import { IbMatTextareaControl } from 'src/app/inobeta-ui/ui/material-forms/controls/textarea';
import { IbMatButtonControl } from 'src/app/inobeta-ui/ui/material-forms/controls/button';
import { IbMatPaddingControl } from 'src/app/inobeta-ui/ui/material-forms/controls/padding';

@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit, AfterViewInit {
  defaultFormFields: IbFormControlBase<string>[] = [
    new IbTextbox({
      key: 'defaultTextbox',
      label: 'First name',
      required: true,
    })
  ];

  customFormFields: IbFormControlBase<any>[] = [
    new IbMatTextboxControl({
      key: 'firstName',
      label: 'First name *',
      width: '50%',
      errors: [{
        condition: (c) => {
          if(c.value !== 'Pippo'){
            c.setErrors({'incorrect': true})
            return true;
          }
          return false;
        },
        message: 'Il valore di questo campo deve essere "Pippo"'
      }]
    }),
    new IbMatTextboxControl({
      key: 'disabledField',
      label: 'Disabled Field',
      width: '50%',
      disabled: true
    }),

    new IbMatTextboxControl({
      key: 'changeValueField',
      label: 'Change my value',
      required: true,
      validators: [Validators.minLength(3), Validators.maxLength(5)],
      width: '33.3%',
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatTextboxControl({
      type: 'email',
      key: 'email',
      label: 'Email',
      width: '33.3%',
      required: true,
      validators: [Validators.email]
    }),
    new IbMatDatepickerControl({
      type: 'date',
      key: 'dateTime',
      width: '33.3%',
      label: 'Date',
      required: true,
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatDropdownControl({
      key: 'options',
      label: 'Options',
      width: '33.3%',
      value: 'test2',
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
    new IbMatDropdownControl({
      key: 'optionsMultiple',
      label: 'Options Multiple',
      width: '33.3%',
      value: ['test1'],
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
      width: '33.3%',
      options: [
        { key: 'las-1', value: 'Lasagne' },
        { key: 'macc-2', value: 'Maccheroni' },
      ]
    }),
    new IbMatCheckboxControl({
      key: 'checked',
      label: 'check this',
      width: '25%'
    }),

    new IbMatTextboxControl({
      key: 'disabledField2',
      label: 'Disabled Field2',
      width: '50%',
      disabled: true
    }),
    new IbMatPaddingControl({
      width: '25%'
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
      width: '16.65%'
    }),
    new IbMatLabelControl({
      value: 'Static value2 long text long text long text long text long text long text long text long text',
      label: 'Static label2 long text long text long text long text',
      width: '33.3%'
    }),
    new IbMatButtonControl({
      key: 'clear',
      label: 'Clear button inside form',
      color: 'accent',
      width: '16.65%',
      handler: (form) => form.reset()
    }),
    new IbMatTextareaControl({
      key: 'textarea',
      label: 'Enter long text',
      width: '100%',
      height: '120px'
    }),
  ];
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

  loginFormFields = [
    new MyCustomTextbox({
      key: 'username',
      label: 'Username',
      required: true,
      testField: 'prova',
      validators: [Validators.minLength(3)]
    } as MyCustomTextboxParams),
    new IbMatTextboxControl({
      key: 'password',
      label: 'shared.login.password',
      type: 'password',
      required: true,
      validators: [Validators.minLength(8)]
    })
  ];

  noFormFields = [
    new IbMatTextboxControl({
      key: 'existing',
      label: 'existing IbTextbox',
      width: '50%'
    })
  ];

  noFormActions = [
    new IbMatButtonControl({
      key: 'submit',
      label: 'Invia'
    })
  ]

  @ViewChild('customForm', {static: false}) customForm: IbMaterialFormComponent;

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    console.log('customForm', this.customForm.form.getRawValue());
    setTimeout(() => {
      this.noFormFields = [
        ...this.noFormFields,
        new IbMatTextboxControl({
          key: 'created',
          label: 'created IbTextbox',
          width: '50%',
          required: true
        })
      ];
    }, 3000);
  }

  onSubmit(payload) {
    console.log('example', payload);
  }
}
