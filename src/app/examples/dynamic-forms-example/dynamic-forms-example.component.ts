import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { IbDropdown, IbFormArray } from "public_api";
import { IbTextbox } from "src/app/inobeta-ui/ui/forms/controls/textbox";
import { IbFormField } from "src/app/inobeta-ui/ui/forms/forms.types";
import { IbMatButtonControl } from "src/app/inobeta-ui/ui/material-forms/controls/button";
import { IbMatTextboxControl } from "src/app/inobeta-ui/ui/material-forms/controls/textbox";
import {
  IbMatActionsPosition,
  IbMaterialFormComponent,
} from "src/app/inobeta-ui/ui/material-forms/material-form/material-form.component";

@Component({
  selector: "app-dynamic-forms-example",
  templateUrl: "./dynamic-forms-example.component.html",
  styleUrls: ["./dynamic-forms-example.component.css"],
})
export class DynamicFormsExampleComponent implements OnInit, AfterViewInit {
  @ViewChild("emptyForm", { static: true }) emptyForm: IbMaterialFormComponent;
  ibMatActionsPosition = IbMatActionsPosition;
  defaultFormFields: IbFormField[] = [
    new IbTextbox({
      key: "defaultTextbox",
      label: "First name",
      required: true,
    }),
    new IbFormArray({
      key: "questions",
      fields: [
        new IbDropdown({
          key: "question",
          label: "question",
          options: [
            { key: "dog", value: "What's the name of your dog?" },
            { key: "cat", value: "What's the name of your cat?" },
          ],
        }),
        new IbTextbox({
          key: "answer",
          label: "answer",
        }),
      ],
    }),
  ];

  customFormActions = [
    new IbMatButtonControl({
      key: "submit",
      label: "Search",
    }),
    new IbMatButtonControl({
      key: "edit",
      label: "Edit",
      color: "basic",
      handler: (form) => form.enable(),
    }),
    new IbMatButtonControl({
      key: "clear",
      label: "Clear",
      color: "accent",
      requireConfirmOnDirty: true,
      handler: (form) => form.reset(),
    }),
  ];

  noFormFields = [
    new IbMatTextboxControl({
      key: "existing",
      label: "existing IbTextbox",
      width: "50%",
    }),
  ];

  noFormActions = [
    new IbMatButtonControl({
      key: "submit",
      label: "Invia",
    }),
  ];

  constructor() {}

  ngOnInit() {
    this.emptyForm.afterChanges().subscribe(({ changes, form }) => {
      console.log("#emptyForm afterChanges()");
      console.log(changes);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.noFormFields = [
        ...this.noFormFields,
        new IbMatTextboxControl({
          key: "created",
          label: "created IbTextbox",
          width: "50%",
          required: true,
        }),
      ];
    }, 3000);
  }

  onSubmit(payload) {
    console.log("example", payload);
  }
}
