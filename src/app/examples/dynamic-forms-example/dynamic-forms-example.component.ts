import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IbFormControlBase } from 'src/app/inobeta-ui/ui/forms/controls/form-control-base';
import { IbTextbox } from 'src/app/inobeta-ui/ui/forms/controls/textbox';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { IbMatActionsPosition, IbMaterialFormComponent } from 'src/app/inobeta-ui/ui/material-forms/material-form/material-form.component';
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
import { IbMatSlideToggleControl } from 'src/app/inobeta-ui/ui/material-forms/controls/slide-toggle';

@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit, AfterViewInit {
  @ViewChild('customForm', {static: true}) customForm: IbMaterialFormComponent;
  ibMatActionsPosition = IbMatActionsPosition;
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
      label: 'First name',
      width: '50%',
      cols: 2,
      rows: 1,
      required: true,
      validators: [
        forceValueValidator('Pluto', 'examples.customErrorMessageExample')
      ]
    }),
    new IbMatTextboxControl({
      key: 'disabledField',
      label: 'Disabled Field',
      width: '50%',
      cols: 2,
      rows: 1,
      disabled: true
    }),

    new IbMatTextboxControl({
      key: 'changeValueField',
      label: 'Change my value',
      validators: [Validators.minLength(3), Validators.maxLength(5), Validators.required],
      width: '33.3%',
      change: (control) => {
        console.log('current value', control.value);
      },
      hintMessage: () => {
        return 'write something\nanother like';
      }
    }),
    new IbMatTextboxControl({
      type: 'email',
      key: 'email',
      label: 'Email',
      width: '33.3%',
      cols: 2,
      rows: 1,
      required: true,
      validators: [Validators.email]
    }),
    new IbMatDatepickerControl({
      type: 'date',
      key: 'dateTime',
      width: '33.3%',
      label: 'Date',
      value: '2021-01-pippa',
      required: true,
      validators: [Validators.min((new Date('2021-05-12')).getTime())],
      change: (control) => {
        if (control.value) {
          console.log('current value', control.value, control.value.getFullYear());
        }
      }
    }),
    new IbMatDropdownControl({
      key: 'options',
      label: 'Options',
      width: '22%',
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
      width: '22%',
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
      },
      hintMessage: () => 'Multiple value selection'
    }),

    new IbMatDropdownControl({
      key: 'numbers',
      label: 'With numeric keys',
      width: '22%',
      value: 2,
      emptyRow: {key: null, value: 'shared.ibDropdown.nullLabel'},
      options: [
        { key: 1, value: 'value1' },
        { key: 2, value: 'value2' },
        { key: 3, value: 'value3' },
        { key: 4, value: 'value4' }
      ],
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatCheckboxControl({
      key: 'checked',
      label: 'check this',
      width: '12.5%'
    }),
    new IbMatSlideToggleControl({
      key: 'slide',
      label: 'slide this',
      width: '12.5%'
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

    new IbMatTextboxControl({
      key: 'disabledField2',
      label: 'Disabled Field2',
      width: '50%',
      disabled: true
    }),
    new IbMatPaddingControl({
      width: '25%',
      cols: 2,
      rows: 1,
    }),

    new IbMatAutocompleteControl({
      key: 'autocomplete',
      label: 'Autocomplete',
      width: '33.3%',
      cols: 2,
      rows: 1,
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
      width: '33.3%',
      cols: 1,
      rows: 3,
    }),
    new IbMatButtonControl({
      key: 'clear',
      label: 'Clear button inside form',
      color: 'accent',
      width: '16.65%',
      cols: 3,
      rows: 1,
      handler: (form) => form.reset()
    }),
    new IbMatTextareaControl({
      key: 'textarea',
      label: 'Enter long text',
      width: '100%',
      height: '120px',
      cols: 3,
      rows: 2,
    }),
    new IbMatTextboxControl({
      key: 'numberValue',
      label: 'Enter a number',
      type: 'number',
      width: '25%',
      validators: [Validators.min(3), Validators.max(12)]
    }),
    new IbMatDatepickerControl({
      type: 'date',
      key: 'dateFrom',
      width: '25%',
      label: 'Date from',
      debounceOnChange: 0,
      change: (control) => {
        const dateTo = control.parent.controls['dateTo'];
        dateTo.updateValueAndValidity();
      }
    }),
    new IbMatDatepickerControl({
      type: 'date',
      key: 'dateTo',
      width: '25%',
      label: 'Date to',
      validators: [this.dateValidator(), this.multipleCustomExample()]
    }),
  ];
  customFormActions = [
    new IbMatButtonControl({
      key: 'submit',
      label: 'Search'
    }),
    new IbMatButtonControl({
      key: 'edit',
      label: 'Edit',
      color: 'basic',
      handler: (form) => form.enable()
    }),
    new IbMatButtonControl({
      key: 'clear',
      label: 'Clear',
      color: 'accent',
      requireConfirmOnDirty: true,
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
  ];


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

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!control.parent) { return; }
      const dateFrom = control.parent.controls['dateFrom'];
      const dateTo = control.parent.controls['dateTo'];
      if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
        return {
          customError: {
            message: '"Date from" non può essere maggiore di "Date to"'
          }
        };
      }
    };
  }



  multipleCustomExample(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (control.value && control.value.getTime() < (new Date('2021-04-15')).getTime()) {
        return {
          customError: {
            message: 'Impostare un valore successivo al 15/04/2021'
          }
        };
      }
    };
  }

}



export function forceValueValidator(forcedValue: string, errorMessage: string): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.value !== forcedValue) {
      return {
        customError: {
          message: errorMessage,
          params: {
            forcedValue
          }
        }
      };
    }
  };
}
