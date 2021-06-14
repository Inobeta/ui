import { TestBed, waitForAsync } from '@angular/core/testing';

import { IbToolTestModule } from '../../../tools';
import { CommonModule } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IbMatDateAdapter } from './datepicker.intl';
import { ibMatDatepickerTranslate } from '../material-form.module';
import { TranslateService } from '@ngx-translate/core';



describe('IbMatDateAdapter', () => {
  let adapter: DateAdapter<Date>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      imports: [
        IbToolTestModule,
        CommonModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: DateAdapter, useClass: IbMatDateAdapter },
        { provide: MAT_DATE_FORMATS, deps: [TranslateService], useFactory: ibMatDatepickerTranslate},
      ]
    })
    .compileComponents();

    adapter = TestBed.inject(DateAdapter);
  }));


  it('should create', () => {
    expect(adapter).toBeTruthy();
  });


  it('should parse', () => {
    let parsedDate = adapter.parse('01/06/2021', null);
    expect(parsedDate.getFullYear()).toEqual(2021);
    expect(parsedDate.getMonth()).toEqual(5);
    expect(parsedDate.getDate()).toEqual(1);

    parsedDate = adapter.parse('', null);
    expect(parsedDate).toBe(null);


    parsedDate = adapter.parse('abc123', null);
    expect(parsedDate.getTime()).toBeNaN();

  });

});
