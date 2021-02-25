import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialFormComponent } from './material-form.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IbMaterialFormControlComponent } from '../material-form-control/material-form-control.component';
import { IbDynamicFormsModule, IbFormControlBase, IbTextbox, IbDropdown, IbRadio, IbCheckbox } from '../../forms';
import { MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule, MatButtonModule } from '@angular/material';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';


@Component({
  selector: 'host-test',
  template: `
  <ib-material-form #customForm [actions]="customFormActions" [fields]="customFormFields" (ibSubmit)="onSubmit($event)"></ib-material-form>
  `
})

export class TestHostComponent {
  customFormActions = [
    { key: 'submit', label: 'Search' },
    {
      key: 'clear',
      label: 'Clear',
      options: { color: 'accent' },
      handler: (form) => form.reset()
    }
  ];

  customFormFields: IbFormControlBase<string>[] = [
    new IbTextbox({
      key: 'firstName',
      label: 'First name',
      required: true,
      validators: [Validators.minLength(3)],
      errors: [{
        condition: (c) => c.hasError('required'),
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

  onSubmit() {}
}



describe('IbMaterialFormComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: IbMaterialFormComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbMaterialFormComponent, IbMaterialFormControlComponent, TestHostComponent ],
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
        NoopAnimationsModule
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
      new IbTextbox({
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
