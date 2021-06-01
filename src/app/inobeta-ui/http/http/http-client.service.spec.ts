import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {IbAuthService} from '../auth/auth.service';
import {IbHttpClientService} from './http-client.service';
import {IbResponseHandlerService} from './response-handler.service';
import {IbAuthTypes} from '../auth/session.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {throwError, of} from 'rxjs';
import { HTTP } from '@ionic-native/http/ngx';
import { authServiceStub } from '../auth/auth.service.stub.spec';
import { responseHandlerStub } from './response-handler.service.stub.spec';

describe('http client test', () => {

  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const samplePromise = (resolve, reject) => {
    resolve({data: '' });
  };
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: IbAuthService, useValue: authServiceStub},
        { provide: IbResponseHandlerService, useValue: responseHandlerStub},
        { provide: HTTP, useValue: {
          get: () => new Promise(samplePromise),
          put: () => new Promise(samplePromise),
          post: () => new Promise(samplePromise),
          delete: () => new Promise(samplePromise),
        }},
        IbHttpClientService
      ]
    }).compileComponents();
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    const svHttpClientService = TestBed.inject(IbHttpClientService);
    svHttpClientService.httpMode = 'NORMAL';
    svHttpClientService.hMobile = null;
  });

  it('Should be created', () => {
    const svHttpClientService = TestBed.inject(IbHttpClientService);
    expect(svHttpClientService).toBeTruthy();
  });

  it('Should be use setAuthType', () => {
    const svHttpClientService = TestBed.inject(IbHttpClientService);
    svHttpClientService.setAuthtype(IbAuthTypes.JWT);
    expect(svHttpClientService.authType).toBe(1);
  });

  it('createAuthorizationHeader', () => {
    const svHttpClientService = TestBed.inject(IbHttpClientService);
    svHttpClientService.setAuthtype(IbAuthTypes.BASIC_AUTH);
    svHttpClientService.createAuthorizationHeader();
    svHttpClientService.setAuthtype(IbAuthTypes.JWT);
    svHttpClientService.createAuthorizationHeader();
    svHttpClientService.setAuthtype(null);
    svHttpClientService.createAuthorizationHeader();

    svHttpClientService.httpMode = 'MOBILE';
    svHttpClientService.setAuthtype(IbAuthTypes.BASIC_AUTH);
    svHttpClientService.createAuthorizationHeader();
    svHttpClientService.setAuthtype(IbAuthTypes.JWT);
    svHttpClientService.createAuthorizationHeader();
    svHttpClientService.setAuthtype(null);
    svHttpClientService.createAuthorizationHeader();
  });

  it('createAuthorizationHeader', () => {
    authServiceStub.activeSession = null;
    const svHttpClientService = TestBed.inject(IbHttpClientService);
    svHttpClientService.createAuthorizationHeader();
  });

  it('should use turnOffModal with pendind Request > 0', () => {
    const svHttpClientService = TestBed.inject(IbHttpClientService);
    const spyModal = spyOn(svHttpClientService, 'turnOffModal');
    const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
    const testData = {name: 'Test Data'};
    svHttpClientService.pendingRequests = 10;
    svHttpClientService.put('/ciao/put', testData)
      .subscribe(data =>
        expect(data).toEqual(testData)
      );
    const req = httpMock.expectOne('/ciao/put');
    expect(req.request.method).toEqual('PUT');
    req.flush(testData);
    httpMock.verify();
    expect(spyModal).toHaveBeenCalled();
    expect(spyHead).toHaveBeenCalled();

  });


  runTestCase('get');
  runTestCase('post');
  runTestCase('put');
  runTestCase('delete');




  function runTestCase(method) {

    it(`should use ${method}`, (done) => {
      const svHttpClientService = TestBed.inject(IbHttpClientService);
      const spyModal = spyOn(svHttpClientService, 'turnOffModal');
      const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
      const testData = {name: 'Test Data'};
      svHttpClientService[method]('/ciao/')
        .subscribe(data =>
          expect(data).toEqual(testData)
        );
      const req = httpMock.expectOne('/ciao/');
      expect(req.request.method).toEqual(method.toUpperCase());
      req.flush(testData);
      httpMock.verify();
      expect(spyModal).toHaveBeenCalled();
      expect(spyHead).toHaveBeenCalled();



      svHttpClientService.httpMode = 'MOBILE';
      const httpMobile = TestBed.inject(HTTP);
      svHttpClientService.hMobile = httpMobile;
      svHttpClientService[method]('/ciao/').subscribe(
        (data) => {
          done();
        },
        (data) => {
          done();
        }
      );
    });

    it(`should use ${method} with null`, () => {
      const svHttpClientService = TestBed.inject(IbHttpClientService);
      const spyModal = spyOn(svHttpClientService, 'turnOffModal');
      const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
      const testData = null;
      svHttpClientService[method]('/ciao/')
        .subscribe(data =>
          expect(data).toEqual(testData)
        );
      const req = httpMock.expectOne('/ciao/');
      expect(req.request.method).toEqual(method.toUpperCase());
      req.flush(testData);
      httpMock.verify();
      expect(spyModal).toHaveBeenCalled();
      expect(spyHead).toHaveBeenCalled();

    });

    it(`should use ${method} FAIL`, (done) => {
      const svHttpClientService = TestBed.inject(IbHttpClientService);
      svHttpClientService[method]('/ciao/')
        .subscribe((res: any) => {
          expect(res.failure.error.type).toBe('ERROR_' + method.toUpperCase());
          done();
        }, () => {
          console.log('error');
          done();
        });
      const getRequest = httpMock.expectOne('/ciao/');
      getRequest.error(new ErrorEvent('ERROR_' + method.toUpperCase()));
      httpMock.verify();


    });
  }

});


