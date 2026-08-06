import {TestBed} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbToastTestModule } from '../../ui/toast/toast-test.module';
import { throwError } from 'rxjs';
import { IbErrorInterceptor } from './error.interceptor';
import { IbToastNotification } from '../../ui/toast/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('IbErrorInterceptor', () => {

  let service: IbErrorInterceptor;
  let toastCall;
  const httpRequestSpy = jasmine.createSpyObj('HttpRequest', ['doesNotMatter']);
  const httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [RouterTestingModule,
        IbToolTestModule,
        IbToastTestModule],
    providers: [
        { provide: "ibHttpEnableInterceptors", useValue: true },
        {
            provide: "ibHttpToastOnGenericFailure",
            useValue: "shared.ibHttp.genericFailure",
        },
        {
            provide: "ibHttpToastOnStatusCode",
            useValue: {},
        },
        {
            provide: "ibHttpToastErrorCode",
            useValue: null,
        },
        {
            provide: "ibHttpToastErrorField",
            useValue: null,
        },
        IbErrorInterceptor,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
    service = TestBed.inject(IbErrorInterceptor);
    toastCall = spyOn(TestBed.inject(IbToastNotification), 'open').and.callThrough();
    toastCall.calls.reset();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should an error', async () => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error:
            {message: 'test-error'}
        }
    ));
    await new Promise<void>((resolve) => service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(toastCall).toHaveBeenCalled();
      resolve();
    }));
  });



  it('Should ignore 401', async () => {
    httpHandlerSpy.handle.and.returnValue(throwError(() => (
        {
          status: 401,
          error:
            {message: 'test-error'}
        })
    ));

    await new Promise<void>((resolve) => service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(toastCall).not.toHaveBeenCalled();
      resolve();
    }));
  });


  it('Should be disabled', async () => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error:
            {message: 'test-error'}
        }
    ));

    service.ibHttpEnableInterceptors = false;
    await new Promise<void>((resolve) => service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(toastCall).not.toHaveBeenCalled();
      resolve();
    }));
  });

  it('Should display a custom message from api', async () => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error: {
            customMessage: 'it does not works'
          }
        }
    ));

    service.ibHttpToastErrorField = 'customMessage';
    await new Promise<void>((resolve) => service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(toastCall).toHaveBeenCalledWith('it does not works', 'error');
      resolve();
    }));
  });

  it('Should override message on status code', async () => {
    const spy = httpHandlerSpy.handle.and.returnValue(throwError(
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
    await new Promise<void>((resolve) => service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(toastCall).toHaveBeenCalledWith('Page not found', 'error');
      resolve();
    }));
  });

  it('Should use a translated message for specific error codes on back end', async () => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 404,
          error: {
            code: 666999,
            customMessage: 'it does not works'
          }
        }
    ));

    const translate = TestBed.inject(TranslateService);
    const spyT = spyOn(translate, 'instant').and.callFake(() => 'translated_code');

    service.ibHttpToastErrorCode = 'code';
    service.ibHttpToastOnStatusCode = {
      404: 'Page not found'
    };
    await new Promise<void>((resolve) => service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(spyT).toHaveBeenCalledWith('shared.ibHttp.error666999');
      expect(toastCall).toHaveBeenCalledWith('translated_code', 'error');
      resolve();
    }));
  });

});

