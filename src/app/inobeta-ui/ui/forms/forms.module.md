# Dynamic Form Module

Modulo per generare forms.

## Utilizzo

Definire i campi del form attraverso un array di [IbFormField](/classes/IbFormField.html). Gli unici valori richiesti sono `key` e `label`, dove `key` viene assegnato come `formControlName`.

`IbDynamicFormComponent` espongono un evento `ibSubmit` corrispondente a `ngSubmit`.

Per un maggiore controllo sui forms, è possibile estendere le azioni possibili oltre al submit attraverso l'input [actions](/interfaces/IbFormAction.html).
Ogni azione necessita di un campo `key`, `label`, e `handler` (callback) eccetto per il bottone relativo alla submit del form. Ricorda: **Deve esistere almeno un azione con `key: 'submit'`**

```typescript
// dynamic-forms-example.component.ts
@Component({
  selector: "app-dynamic-forms-example",
  templateUrl: "./dynamic-forms-example.component.html",
  styleUrls: ["./dynamic-forms-example.component.css"],
})
export class DynamicFormsExampleComponent implements OnInit {
  fields: IbFormField[] = [
    new IbMatTextboxControl({
      key: "firstName",
      label: "First name",
      required: true,
      validators: [Validators.minLength(3)],
    }),
    new IbMatTextboxControl({
      type: "email",
      key: "email",
      label: "Email",
      required: true,
      validators: [Validators.email],
    }),
    new IbMatTextboxControl({
      type: "date",
      key: "dateTime",
      label: "Date",
      required: true,
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
    }),
    new IbMatRadioControl({
      key: "food",
      value: "test-1",
      label: "Scegli qualcosa",
      options: [
        { key: "las-1", value: "Lasagne" },
        { key: "macc-2", value: "Maccheroni" },
      ],
    }),
    new IbMatCheckboxControl({
      key: "checked",
      label: "check this",
      width: "12.5%",
    }),
    new IbFormArray({
      key: "addresses",
      options: {
        max: 2,
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
    { key: "submit", label: "Search" },
    {
      key: "clear",
      label: "Clear",
      options: { color: "accent" },
      handler: (form) => form.reset(),
    },
  ];

  constructor() {}

  ngOnInit() {}

  onSubmit(payload) {
    console.log("example", payload);
  }
}
```

```html
<!-- dynamic-forms-example.component.html -->
<ib-material-form [fields]="fields" [actions]="actions" (ibSubmit)="onSubmit($event)"></ib-material-form>
```

## Customizzazione CSS

Sono disponibili delle classi CSS per personalizzare lo stile del form, sotto-sezione del form array e le singole linee, ed i control.

|nome classe|elemento|
|-|-|
|ibForm|Container del form
|ibFormArray|Container di un form array
|ibFormArrayActions|Container delle azioni di un form array
|ibFormArrayItem|Linea di un form array
|ibFormRow|Container form control
|ibFormActions|Container per azioni del form

Esempio per aggiungere un separatore tra le linee di un form array

```css
.customForm ::ng-deep .ibFormArrayItem {
  border-bottom: 1px solid #888;
  margin-bottom: 1em;
  padding-bottom: .33em;
}```