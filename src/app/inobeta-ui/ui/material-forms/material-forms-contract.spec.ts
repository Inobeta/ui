import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbMaterialFormModule } from './index';

@Component({
  template: `
    <div ib-mat-autocomplete></div>
    <button ib-mat-button></button>
    <div ib-mat-checkbox></div>
    <div ib-mat-datepicker></div>
    <div ib-mat-dropdown></div>
    <div ib-mat-label></div>
    <div ib-mat-padding></div>
    <div ib-mat-radio></div>
    <div ib-mat-slide-toggle></div>
    <div ib-mat-textarea></div>
    <div ib-mat-textbox></div>
  `,
  standalone: false,
})
class IbMaterialFormsOptionalInputsTestComponent {}

describe('deprecated Material Forms input contracts', () => {
  it('should compile every exported control without a required data input', waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IbMaterialFormsOptionalInputsTestComponent],
      imports: [IbMaterialFormModule],
    }).compileComponents();
  }));
});
