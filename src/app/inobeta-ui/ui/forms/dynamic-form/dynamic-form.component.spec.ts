import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IbDynamicFormComponent } from './dynamic-form.component';
import { DynamicFormControlStubComponent } from '../dynamic-form-control/dynamic-form-control-stub.spec';
import { ReactiveFormsModule } from '@angular/forms';
import { IbFormControlService } from '../form-control.service';

describe('IbDynamicFormComponent', () => {
  let component: IbDynamicFormComponent;
  let fixture: ComponentFixture<IbDynamicFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IbDynamicFormComponent, DynamicFormControlStubComponent ],
      providers: [IbFormControlService],
      imports: [ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IbDynamicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
