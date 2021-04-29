import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IbToolTestModule } from '../../tools';
import { IbHttpModule } from '../http.module';
import { ibCrudDetailSave } from './messages.decorator';

describe('ibCrudDetailSave Decorator', () => {
  @Injectable()
  class SampleService {
    @ibCrudDetailSave(true)
    serviceCall() {
      return of({});
    }


    @ibCrudDetailSave()
    serviceCallWithDefaults() {
      return of({});
    }
  }
  let testService: SampleService;



  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        IbHttpModule,
        IbToolTestModule,
        NoopAnimationsModule
      ],
      providers: [
        SampleService
      ]
    }).compileComponents();
    testService = TestBed.get(SampleService);
  });

  it('Should be created', () => {
    expect(testService).toBeTruthy();
    testService.serviceCall().subscribe();
    testService.serviceCallWithDefaults().subscribe()
  });


});
