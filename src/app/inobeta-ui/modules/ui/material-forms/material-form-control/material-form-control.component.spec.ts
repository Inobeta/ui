import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IbMaterialFormControlComponent } from './material-form-control.component';
import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormsModule } from '../../forms';

xdescribe('IbMaterialFormControlComponent', () => {
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
        IbDynamicFormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbMaterialFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
