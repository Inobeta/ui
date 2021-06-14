import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IbMaterialFormControlComponent } from './material-form-control.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { IbDynamicFormsModule, IbTextbox } from '../../forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
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
    component.form = new FormGroup({
      test: new FormControl()
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
