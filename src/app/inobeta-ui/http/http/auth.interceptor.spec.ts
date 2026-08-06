import {TestBed} from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { IbAuthInterceptor } from './auth.interceptor';
import { RouterTestingModule } from '@angular/router/testing';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbToastTestModule } from '../../ui/toast/toast-test.module';
import { throwError } from 'rxjs';

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IbLoginService } from '../auth/login.service';
import { IbLoginServiceStub } from '../auth/login.service.stub.spec';
import { HttpRequest, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { IbAuthTypes } from '../auth/session.model';

@Component({
    selector: 'login-dummy',
    template: ``,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class LoginDummyComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}


describe('IbAuthInterceptor', () => {

  let service: IbAuthInterceptor;
  let routerCall;
  const httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

  beforeEach(async () => {
    TestBed.configureTestingModule({
    declarations: [LoginDummyComponent],
    imports: [RouterTestingModule.withRoutes([
            { path: 'login', component: LoginDummyComponent },
        ]),
        IbToolTestModule,
        IbToastTestModule],
    providers: [
        { provide: IbLoginService, useClass: IbLoginServiceStub },
        { provide: "ibHttpEnableInterceptors", useValue: true },
        { provide: "ibHttpAuthType", useValue: IbAuthTypes.JWT },
        {
            provide: "ibHttpAPILoginUrl",
            useValue: "/api/auth/login",
        },
        {
            provide: "ibHttpToastOnLoginFailure",
            useValue: "shared.ibHttp.authFailure",
        },
        IbAuthInterceptor,
        provideMockStore({}),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
}).compileComponents();
    service = TestBed.inject(IbAuthInterceptor);
    routerCall = spyOn(TestBed.inject(IbLoginService), 'logout').and.callThrough();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should detect 401', async () => {
    httpHandlerSpy.handle.and.returnValue(
      throwError(
        () =>
          ({
            status: 401,
            error: { message: "test-error" },
          })
      )
    );
    const requestMock = new HttpRequest('GET', '/test');
    await new Promise<void>((resolve) => service.intercept(requestMock, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(routerCall).toHaveBeenCalled();
      resolve();
    }));
  });



  it('Should ignore other errors', async () => {
    httpHandlerSpy.handle.and.returnValue(
      throwError(
        () =>
          ({
            status: 404,
            error: { message: "test-error" },
          })
      )
    );
    const requestMock = new HttpRequest('GET', '/test');
    console.log('service.ibHttpAPILoginUrl', service.ibHttpAPILoginUrl)
    await new Promise<void>((resolve) => service.intercept(requestMock, httpHandlerSpy).subscribe(() => {
      console.log('success')
      resolve();
    }, (err) => {
      expect(routerCall).not.toHaveBeenCalled();
      resolve();
    }));
  });


  it('Should be disabled', async () => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 401,
          error:
            {message: 'test-error'}
        }
    ));

    service.ibHttpEnableInterceptors = false;
    const requestMock = new HttpRequest('GET', '/test');
    await new Promise<void>((resolve) => service.intercept(requestMock, httpHandlerSpy).subscribe(() => {
      resolve();
    }, () => {
      expect(routerCall).not.toHaveBeenCalled();
      resolve();
    }));
  });



});

