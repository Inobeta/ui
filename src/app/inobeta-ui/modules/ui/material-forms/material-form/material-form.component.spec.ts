import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialFormComponent } from './material-form.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbMaterialFormControlComponent } from '../material-form-control/material-form-control.component';
import { IbDynamicFormsModule } from '../../forms';
import { MatFormFieldModule, MatOptionModule, MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule, MatButtonModule } from '@angular/material';


describe('IbMaterialFormComponent', () => {
  let component: IbMaterialFormComponent;
  let fixture: ComponentFixture<IbMaterialFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbMaterialFormComponent, IbMaterialFormControlComponent ],
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
        MatButtonModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
