import { Component } from "@angular/core";
import { Validators } from "@angular/forms";
import { BehaviorSubject, Subscription, interval } from "rxjs";
import { IbFormArray } from "src/app/inobeta-ui/ui/forms/array/array";
import { IbFormField } from "src/app/inobeta-ui/ui/forms/forms.types";
import {
  IbMatButtonControl,
  IbMatLabelControl,
  IbMatTextboxControl,
} from "src/app/inobeta-ui/ui/material-forms";
import { createNewUser } from "../kai-table-example/users";

type ContactInfo = {
  fullName: string;
  addresses: { key: string; value: string }[];
};

@Component({
  selector: "ib-material-form-value-example",
  template: `
    <mat-card appearance="outlined">
      <mat-card-header>
        <mat-card-title>Form</mat-card-title>
        <mat-card-subtitle
          >data will refresh every three seconds</mat-card-subtitle
        >
      </mat-card-header>
      <mat-card-content>
        <ib-material-form
          [value]="value$ | async"
          [actions]="actions"
          [fields]="formWithArray"
          (ibSubmit)="onSubmit($event)"
        ></ib-material-form>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    :host {
      margin: 2em;
      display: flex;
      flex-direction: column;
      gap: 2em;
    }
  `,
})
export class MaterialFormValueExampleComponent {
  value$ = new BehaviorSubject<Partial<ContactInfo>>({});
  interval: Subscription;

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
        max: 5,
      },
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

  actions = [
    new IbMatButtonControl({
      key: "submit",
      label: "Search",
    }),
    new IbMatButtonControl({
      key: "start",
      label: "start",
      handler: () => this.start(),
    }),
    new IbMatButtonControl({
      key: "stop",
      label: "stop",
      handler: () => this.stop(),
    }),
  ];

  ngOnDestroy() {
    this.interval?.unsubscribe();
  }

  start() {
    if (this.interval) {
      this.stop();
    }
    this.refresh();
    this.interval = interval(3000).subscribe(() => this.refresh());
  }

  stop() {
    this.interval.unsubscribe();
  }

  refresh() {
    const user = createNewUser(1);
    this.value$.next({
      fullName: user.name,
      addresses: Array(user.number)
        .fill("")
        .map((f) => ({
          key: Math.random().toFixed(2),
          value: Math.random().toFixed(2),
        })),
    });
  }

  onSubmit(data) {
    console.log(data);
  }
}
