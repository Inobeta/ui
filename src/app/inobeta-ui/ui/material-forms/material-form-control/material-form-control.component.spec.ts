import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IbMaterialFormControlComponent } from './material-form-control.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { IbDynamicFormsModule, IbTextbox } from '../../forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IbModalTestModule } from '../../modal';

describe('IbMaterialFormControlComponent', () => {
  let component: IbMaterialFormControlComponent;
  let fixture: ComponentFixture<IbMaterialFormControlComponent>;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IbMaterialFormControlComponent ],
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
        IbModalTestModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMaterialFormControlComponent);
    component = fixture.componentInstance;
    component.form = new UntypedFormGroup({
      test: new UntypedFormControl()
    });

    component.base = new IbTextbox({
      key: 'test'
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
