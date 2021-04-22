import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialFormControlComponent } from './material-form-control.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { IbDynamicFormsModule, IbTextbox } from '../../forms';
import { MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule, MatButtonModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('IbMaterialFormControlComponent', () => {
  let component: IbMaterialFormControlComponent;
  let fixture: ComponentFixture<IbMaterialFormControlComponent>;


  beforeEach(async(() => {
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
        NoopAnimationsModule
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
