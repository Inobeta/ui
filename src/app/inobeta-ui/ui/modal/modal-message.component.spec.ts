import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatButtonModule, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IbModalMessageComponent } from '.';
import { IbToolTestModule, serviceDialogStub } from '../../tools';


@Component({
  selector: 'host-test',
  template: `
  <ib-modal-message></ib-modal-message>
  `
})

export class TestHostComponent {
}



describe('IbModalMessageComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: IbModalMessageComponent;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbModalMessageComponent, TestHostComponent ],
      imports: [
        IbToolTestModule,
        CommonModule,
        MatDialogModule,
        NoopAnimationsModule,
        MatButtonModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: serviceDialogStub},
        { provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(IbModalMessageComponent)).componentInstance;
    fixture.detectChanges();
    component.dismiss();

  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });
});
