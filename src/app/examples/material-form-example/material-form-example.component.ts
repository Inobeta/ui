import { Component, ViewChild } from "@angular/core";
import { Validators } from "@angular/forms";
import {
  IbMatAutocompleteControl,
  IbMatCheckboxControl,
  IbMatDropdownControl,
  IbMatLabelControl,
  IbMatPaddingControl,
  IbMatSlideToggleControl,
  IbMatTextareaControl,
  IbMaterialFormComponent,
} from "public_api";
import { IbFormField } from "src/app/inobeta-ui/ui/forms/forms.types";
import { IbMatButtonControl } from "src/app/inobeta-ui/ui/material-forms/controls/button";
import { IbMatDatepickerControl } from "src/app/inobeta-ui/ui/material-forms/controls/datepicker";
import { IbMatRadioControl } from "src/app/inobeta-ui/ui/material-forms/controls/radio";
import { IbMatTextboxControl } from "src/app/inobeta-ui/ui/material-forms/controls/textbox";
import {
  MyCustomTextbox,
  MyCustomTextboxParams,
} from "./my-custom-textbox.model";
import {
  dateValidator,
  forceValueValidator,
  multipleCustomExample,
} from "./validators";

@Component({
  selector: "app-material-form-example",
  templateUrl: "./material-form-example.component.html",
  styleUrls: ["./material-form-example.component.css"],
})
export class MaterialFormExampleComponent {
  @ViewChild("customForm", { static: true })
  customForm: IbMaterialFormComponent;

  loginFormFields = [
    new MyCustomTextbox({
      key: "username",
      label: "Username",
      required: true,
      testField: "prova",
      validators: [Validators.minLength(3)],
    } as MyCustomTextboxParams),
    new IbMatTextboxControl({
      key: "password",
      label: "shared.login.password",
      type: "password",
      required: true,
      validators: [Validators.minLength(8)],
    }),
  ];

  customFormFields: IbFormField[] = [
    new IbMatTextboxControl({
      key: "firstName",
      label: "First name",
      width: "50%",
      cols: 2,
      rows: 1,
      required: true,
      validators: [
        forceValueValidator("Pluto", "examples.customErrorMessageExample"),
      ],
    }),
    new IbMatTextboxControl({
      key: "disabledField",
      label: "Disabled Field",
      width: "50%",
      cols: 2,
      rows: 1,
      disabled: true,
    }),

    new IbMatTextboxControl({
      key: "changeValueField",
      label: "Change my value",
      validators: [
        Validators.minLength(3),
        Validators.maxLength(5),
        Validators.required,
      ],
      width: "15%",
      change: (control) => {
        console.log("current value", control.value);
      },
      hintMessage: () => {
        return "write something\nanother like";
      },
    }),
    new IbMatTextboxControl({
      type: "email",
      key: "email",
      label: "Email",
      width: "15%",
      cols: 2,
      rows: 1,
      required: true,
      validators: [Validators.email],
    }),
    new IbMatTextboxControl({
      key: "length",
      label: "MinLength=3, MaxLength=12",
      width: "35%",
      cols: 4,
      rows: 1,
      required: false,
      validators: [Validators.minLength(3), Validators.maxLength(12)],
    }),
    new IbMatDatepickerControl({
      type: "date",
      key: "dateTime",
      width: "35%",
      label: "Date",
      value: "2021-01-pippa",
      required: true,
      validators: [Validators.min(new Date("2021-05-12").getTime())],
      change: (control) => {
        if (control.value) {
          console.log(
            "current value",
            control.value,
            control.value.getFullYear()
          );
        }
      },
    }),
    new IbMatDropdownControl({
      key: "options",
      label: "Options",
      width: "22%",
      value: "test2",
      emptyRow: { key: null, value: "NULL" },
      options: [
        { key: "test1", value: "value1" },
        { key: "test2", value: "value2" },
        { key: "test3", value: "value3" },
        { key: "test4", value: "value4" },
      ],
      change: (control) => {
        console.log("current value", control.value);
      },
    }),
    new IbMatDropdownControl({
      key: "optionsMultiple",
      label: "Options Multiple",
      width: "22%",
      value: ["test1"],
      multiple: true,
      options: [
        { key: "test1", value: "value1" },
        { key: "test2", value: "value2" },
        { key: "test3", value: "value3" },
        { key: "test4", value: "value4" },
      ],
      change: (control) => {
        console.log("current value", control.value);
      },
      hintMessage: () => "Multiple value selection",
    }),

    new IbMatDropdownControl({
      key: "numbers",
      label: "With numeric keys",
      width: "22%",
      value: 2,
      emptyRow: { key: null, value: "shared.ibDropdown.nullLabel" },
      options: [
        { key: 1, value: "value1" },
        { key: 2, value: "value2" },
        { key: 3, value: "value3" },
        { key: 4, value: "value4" },
      ],
      change: (control) => {
        console.log("current value", control.value);
      },
    }),
    new IbMatCheckboxControl({
      key: "checked",
      label: "check this",
      width: "12.5%",
    }),
    new IbMatSlideToggleControl({
      key: "slide",
      label: "slide this",
      width: "12.5%",
    }),

    new IbMatRadioControl({
      key: "food",
      value: "test-1",
      label: "Scegli qualcosa",
      width: "33.3%",
      options: [
        { key: "las-1", value: "Lasagne" },
        { key: "macc-2", value: "Maccheroni" },
      ],
    }),

    new IbMatTextboxControl({
      key: "disabledField2",
      label: "Disabled Field2",
      width: "50%",
      disabled: true,
    }),
    new IbMatPaddingControl({
      width: "25%",
      cols: 2,
      rows: 1,
    }),

    new IbMatAutocompleteControl({
      key: "autocomplete",
      label: "Autocomplete",
      width: "33.3%",
      cols: 2,
      rows: 1,
      options: [
        { value: "value1" },
        { value: "value2" },
        { value: "value3" },
        { value: "value4" },
      ],
      change: (control) => {
        console.log("current value", control.value);
      },
    }),
    new IbMatLabelControl({
      value: "Static value",
      label: "Static label",
      width: "16.65%",
    }),
    new IbMatLabelControl({
      value:
        "Static value2 long text long text long text long text long text long text long text long text",
      label: "Static label2 long text long text long text long text",
      width: "33.3%",
      cols: 1,
      rows: 3,
    }),
    new IbMatButtonControl({
      key: "clear",
      label: "Clear button inside form",
      color: "accent",
      width: "16.65%",
      cols: 3,
      rows: 1,
      handler: (form) => form.reset(),
    }),
    new IbMatTextareaControl({
      key: "textarea",
      label: "Enter long text",
      width: "100%",
      height: "120px",
      cols: 3,
      rows: 2,
    }),
    new IbMatTextboxControl({
      key: "numberValue",
      label: "Enter a number",
      type: "number",
      width: "25%",
      change: (control) => {
        console.log(control.value);
      },
      validators: [Validators.min(3), Validators.max(12)],
    }),
    new IbMatDatepickerControl({
      type: "date",
      key: "dateFrom",
      width: "25%",
      label: "Date from",
      debounceOnChange: 0,
      change: (control) => {
        const dateTo = control.parent.controls["dateTo"];
        dateTo.updateValueAndValidity();
      },
    }),
    new IbMatDatepickerControl({
      type: "date",
      key: "dateTo",
      width: "25%",
      label: "Date to",
      validators: [dateValidator(), multipleCustomExample()],
    }),
  ];

  actions = [
    new IbMatButtonControl({
      key: "submit",
      label: "Login",
    }),
  ];

  customFormActions = [
    new IbMatButtonControl({
      key: "submit",
      label: "Search",
    }),
    new IbMatButtonControl({
      key: "clear",
      label: "Clear",
      color: "accent",
      requireConfirmOnDirty: true,
      handler: (form) => form.reset(),
    }),
    new IbMatButtonControl({
      key: "disable",
      label: "Disable",
      handler: (form) => form.disable(),
    }),
    new IbMatButtonControl({
      key: "enable",
      label: "Enable",
      handler: (form) => form.enable(),
    }),
  ];
  
  ngOnInit() {
    this.customForm.afterInit().subscribe((form) => {
      form.disable();
    });
  }

  onSubmit(data) {
    console.log(data);
  }
}
