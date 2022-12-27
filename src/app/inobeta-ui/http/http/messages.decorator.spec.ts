import { Injectable, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IbToolTestModule } from '../../tools';
import { IbToastNotification } from '../../ui/toast/toast.service';
import { toastServiceStub } from '../../ui/toast/toast.service.stub.spec';
import { IbHttpTestModule } from '../http-test.module';
import { IbHttpModule } from '../http.module';
import { ibCrudToast } from './messages.decorator';

describe('ibCrudToast Decorator', () => {
  @Injectable({providedIn: 'root'})
  class SampleService {
    @ibCrudToast(true)
    serviceCall() {
      return of({});
    }


    @ibCrudToast()
    serviceCallWithDefaults() {
      return of({});
    }
  }
  let testService: SampleService;
  const initialState = { activeSession: 'fake' };


  beforeEach(async () => {
    IbHttpModule.injector = Injector.create({
      providers: [
        { provide: IbToastNotification, useValue: toastServiceStub}
      ],
    });
    TestBed.configureTestingModule({
      imports: [
        IbHttpTestModule,
        IbToolTestModule,
        NoopAnimationsModule
      ],
      providers: [
        SampleService
      ]
    }).compileComponents();
    testService = TestBed.inject(SampleService);
  });

  it('Should be created', () => {
    expect(testService).toBeTruthy();
    testService.serviceCall().subscribe();
    testService.serviceCallWithDefaults().subscribe()
  });


});
