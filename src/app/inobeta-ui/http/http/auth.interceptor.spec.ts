import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {IbAuthService} from '../auth/auth.service';
import {IbResponseHandlerService} from './response-handler.service';
import { authServiceStub } from '../auth/auth.service.stub.spec';
import { responseHandlerStub } from './response-handler.service.stub.spec';
import { IbAuthInterceptor } from './auth.interceptor';
import { RouterTestingModule } from '@angular/router/testing';
import { IbToolTestModule } from '../../tools/tools-test.module';
import { IbToastTestModule } from '../../ui/toast/toast-test.module';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

import { Component, OnInit } from '@angular/core';

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
  const httpRequestSpy = jasmine.createSpyObj('HttpRequest', ['doesNotMatter']);
  const httpHandlerSpy = jasmine.createSpyObj('HttpHandler', ['handle']);

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginDummyComponent},
        ]),
        IbToolTestModule,
        IbToastTestModule
      ],
      declarations: [LoginDummyComponent],
      providers: [
        { provide: IbAuthService, useValue: authServiceStub},
        { provide: IbResponseHandlerService, useValue: responseHandlerStub},
        IbAuthInterceptor
      ]
    }).compileComponents();
    service = TestBed.get(IbAuthInterceptor);
    routerCall = spyOn(TestBed.get(Router), 'navigateByUrl').and.callThrough();
  });

  it('Should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Should detect 401', (done) => {
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
      expect(routerCall).toHaveBeenCalled();
      done();
    });
  });



  it('Should ignore other errors', (done) => {
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
    service.intercept(httpRequestSpy, httpHandlerSpy).subscribe(() => {
      done();
    }, () => {
      expect(routerCall).not.toHaveBeenCalled();
      done();
    });
  });



});


