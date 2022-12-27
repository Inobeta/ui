import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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


  beforeEach(waitForAsync(() => {
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

  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });
});
