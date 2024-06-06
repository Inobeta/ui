import { Component, OnInit, ViewChild } from "@angular/core";
import { Validators } from "@angular/forms";
import { IbFormArray } from "src/app/inobeta-ui/ui/forms/array/array";
import { IbFormField } from "src/app/inobeta-ui/ui/forms/forms.types";
import { IbMaterialFormComponent } from "src/app/inobeta-ui/ui/material-forms";
import { IbMatButtonControl } from "src/app/inobeta-ui/ui/material-forms/controls/button";
import { IbMatLabelControl } from "src/app/inobeta-ui/ui/material-forms/controls/label";
import { IbMatTextboxControl } from "src/app/inobeta-ui/ui/material-forms/controls/textbox";

@Component({
  selector: "app-form-array-example",
  templateUrl: "form-array-example.component.html",
  styles: [
    `
      .customForm ::ng-deep .ibFormArrayItem {
        border-bottom: 1px solid #888;
        margin-bottom: 1em;
        padding-bottom: 0.33em;
      }
    `,
  ],
})
export class MaterialFormArrayExampleComponent implements OnInit {
  @ViewChild("arrayForm", { static: true }) arrayForm: IbMaterialFormComponent;

  formWithArray: IbFormField[] = [
    new IbMatTextboxControl({
      key: "fullName",
      label: "Full name",
    }),
    new IbMatLabelControl({
      value: "Contatti",
      width: "100%",
    }),
    new IbFormArray({
      key: "addresses",
      options: {
        max: 2,
      },
      addRow: (formArray, newLength) => console.log("addRow", formArray, newLength),
      removeRow: (formArray, newLength, removedIndex, removedData) => console.log("removeRow", formArray, newLength, removedIndex, removedData),
      fields: [
        new IbMatTextboxControl({
          key: "key",
          label: "(es. Phone, Email)",
          width: "25%",
        }),
        new IbMatTextboxControl({
          key: "value",
          label: "es. +39123123",
          validators: [Validators.required],
          width: "25%",
        }),
      ],
    }),
  ];

  customFormFields: IbFormField[] = [
    new IbMatTextboxControl({
      key: "firstName",
      label: "First name",
      width: "50%",
    }),

    new IbMatTextboxControl({
      key: "lastName",
      label: "Last name",
      width: "50%",
    }),

    new IbFormArray({
      key: "stuff",
      fields: [
        new IbMatTextboxControl({
          key: "field1",
          label: "Campo 1",
          width: "100%",
        }),
        new IbMatTextboxControl({
          key: "field2",
          label: "Campo 2",
          width: "50%",
        }),
        new IbMatTextboxControl({
          key: "field3",
          label: "Campo 3",
          width: "50%",
        }),
        new IbMatTextboxControl({
          key: "field4",
          label: "Campo 4",
          width: "25%",
        }),
        new IbMatTextboxControl({
          key: "field5",
          label: "Campo 5",
          width: "25%",
        }),
        new IbMatTextboxControl({
          key: "field6",
          label: "Campo 6",
          width: "25%",
        }),
        new IbMatTextboxControl({
          key: "field7",
          label: "Campo 7",
          width: "25%",
        }),
        new IbMatTextboxControl({
          key: "field8",
          label: "Campo 8",
        }),
        new IbMatTextboxControl({
          key: "field9",
          label: "Campo 9",
          validators: [Validators.required],
        }),
      ],
    }),
  ];

  actions = [
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

  constructor() {}

  ngOnInit() {
    this.arrayForm.afterInit().subscribe((form) => form.disable())
  }

  onSubmit(payload) {
    console.log("example", payload);
  }
}
