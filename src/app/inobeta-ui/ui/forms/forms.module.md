# Dynamic Form Module

Modulo per generare forms.

## Utilizzo

Definire i campi del form attraverso un array di [IbFormControlBase](/classes/IbFormControlBase.html). Gli unici valori richiesti sono `key` e `label`, dove `key` viene assegnato come `formControlName`.

`IbDynamicFormComponent` espongono un evento `ibSubmit` corrispondente a `ngSubmit`.

Per un maggiore controllo sui forms, è possibile estendere le azioni possibili oltre al submit attraverso l'input [actions](/interfaces/IbFormAction.html).
Ogni azione necessita di un campo `key`, `label`, e `handler` (callback) eccetto per il bottone relativo alla submit del form. Ricorda: **Deve esistere almeno un azione con `key: 'submit'`**

```typescript
// dynamic-forms-example.component.ts
@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit {
  customFormFields: IbFormControlBase<string>[] = [
    new IbTextbox({
      key: 'firstName',
      label: 'First name',
      required: true,
      validators: [Validators.minLength(3)],
      errors: [{
        condition: (control) => control.hasError('required'),
        message: 'Email richiesta'
      }]
    }),
    new IbTextbox({
      type: 'email',
      key: 'email',
      label: 'Email',
      required: true,
      validators: [Validators.email]
    }),
    new IbTextbox({
      type: 'date',
      key: 'dateTime',
      label: 'Date',
      required: true,
    }),
    new IbDropdown({
      key: 'options',
      label: 'Options',
      options: [
        { key: 'test', value: 'value' }
      ]
    }),
    new IbRadio({
      key: 'food',
      value: 'test-1',
      label: 'Scegli qualcosa',
      options: [
        { key: 'test-1', value: 'Lasagne' },
        { key: 'test-2', value: 'Maccheroni' },
      ],
      required: true
    }),
    new IbCheckbox({
      key: 'checked',
      label: 'check this',
    })
  ];
  customFormActions = [
    { key: 'submit', label: 'Search' },
    {
      key: 'clear',
      label: 'Clear',
      options: { color: 'accent' },
      handler: (form) => form.reset()
    }
  ];

  constructor() {}

  ngOnInit() {}

  onSubmit(payload) {
    console.log('example', payload)
  }
}
```

```html
<!-- dynamic-forms-example.component.html -->
<ib-material-form
  [fields]="customFormFields"
  [actions]="customFormActions"
  (ibSubmit)="onSubmit($event)"></ib-material-form>
```
