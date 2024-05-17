import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { IbAuthInterceptor } from './auth.interceptor';
import { RouterTestingModule } from '@angular/router/testing';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbToastTestModule } from '../../ui/toast/toast-test.module';
import { throwError } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { IbLoginService } from '../auth/login.service';
import { IbLoginServiceStub } from '../auth/login.service.stub.spec';
import { HttpRequest } from '@angular/common/http';
import { provideMockStore } from '@ngrx/store/testing';
import { IbAuthTypes } from '../auth/session.model';

@Component({
  selector: 'login-dummy',
  template: ``
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
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginDummyComponent},
        ]),
        IbToolTestModule,
        IbToastTestModule,
      ],
      declarations: [LoginDummyComponent],
      providers: [
        { provide: IbLoginService, useClass: IbLoginServiceStub},
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
        provideMockStore({  }),
      ]
    }).compileComponents();
    service = TestBed.inject(IbAuthInterceptor);
    routerCall = spyOn(TestBed.inject(IbLoginService), 'logout').and.callThrough();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should detect 401', (done) => {
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
    service.intercept(requestMock, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(routerCall).toHaveBeenCalled();
      done();
    });
  });



  it('Should ignore other errors', (done) => {
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
    service.intercept(requestMock, httpHandlerSpy).subscribe(() => {
      console.log('success')
      done();
    }, (err) => {
      expect(routerCall).not.toHaveBeenCalled();
      done();
    });
  });


  it('Should be disabled', (done) => {
    httpHandlerSpy.handle.and.returnValue(throwError(
        {
          status: 401,
          error:
            {message: 'test-error'}
        }
    ));

    service.ibHttpEnableInterceptors = false;
    const requestMock = new HttpRequest('GET', '/test');
    service.intercept(requestMock, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(routerCall).not.toHaveBeenCalled();
      done();
    });
  });



});


