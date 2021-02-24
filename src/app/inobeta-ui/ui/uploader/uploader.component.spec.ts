import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IbUploaderComponent } from '.';
import { IbToolTestModule, serviceDialogStub } from '../../tools';


@Component({
  selector: 'host-test',
  template: `
  <ib-uploader></ib-uploader>
  `
})

export class TestHostComponent {
}



describe('IbUploaderComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let component: IbUploaderComponent;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IbUploaderComponent, TestHostComponent ],
      imports: [
        IbToolTestModule,
        CommonModule,
        MatDialogModule,
        NoopAnimationsModule
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
    component = fixture.debugElement.query(By.directive(IbUploaderComponent)).componentInstance;
    fixture.detectChanges();
    component.onChooseClick();
    component.onChooseChange();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });
});
