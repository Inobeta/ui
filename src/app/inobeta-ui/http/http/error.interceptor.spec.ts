import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {IbAuthService} from '../auth/auth.service';
import {IbResponseHandlerService} from './response-handler.service';
import { authServiceStub } from '../auth/auth.service.stub.spec';
import { responseHandlerStub } from './response-handler.service.stub.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbToastTestModule } from '../../ui/toast/toast-test.module';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { IbErrorInterceptor } from './error.interceptor';
import { IbToastNotification } from '../../ui/toast/toast.service';

describe('IbErrorInterceptor', () => {

  let service: IbErrorInterceptor;
  let toastCall;
  const httpRequestSpy = jasmine.createSpyObj('HttpRequest', ['doesNotMatter']);
  const httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        IbToolTestModule,
        IbToastTestModule
      ],
      providers: [
        { provide: IbAuthService, useValue: authServiceStub},
        { provide: IbResponseHandlerService, useValue: responseHandlerStub},
        IbErrorInterceptor
      ]
    }).compileComponents();
    service = TestBed.inject(IbErrorInterceptor);
    toastCall = spyOn(TestBed.inject(IbToastNotification), 'open').and.callThrough();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should an error', (done) => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error:
            {message: 'test-error'}
        }
    ));
    service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(toastCall).toHaveBeenCalled();
      done();
    });
  });



  it('Should ignore 401', (done) => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 401,
          error:
            {message: 'test-error'}
        }
    ));

    service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(toastCall).not.toHaveBeenCalled();
      done();
    });
  });


  it('Should be disabled', (done) => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error:
            {message: 'test-error'}
        }
    ));

    service.ibHttpEnableInterceptors = false;
    service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(toastCall).not.toHaveBeenCalled();
      done();
    });
  });

  it('Should display a custom message from api', (done) => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error: {
            customMessage: 'it does not works'
          }
        }
    ));

    service.ibHttpToastErrorField = 'customMessage';
    service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(toastCall).toHaveBeenCalledWith('it does not works', 'error');
      done();
    });
  });

  it('Should override message on status code', (done) => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error: {
            customMessage: 'it does not works'
          }
        }
    ));

    service.ibHttpToastOnStatusCode = {
      404: 'Page not found'
    };
    service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(toastCall).toHaveBeenCalledWith('Page not found', 'error');
      done();
    });
  });

});


