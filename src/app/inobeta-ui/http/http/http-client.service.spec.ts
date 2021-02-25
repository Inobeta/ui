import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {IbAuthService} from '../auth/auth.service';
import {IbHttpClientService} from './http-client.service';
import {IbResponseHandlerService} from './response-handler.service';
import {AuthTypes} from '../auth/session.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {throwError, of} from 'rxjs';
import { HTTP } from '@ionic-native/http/ngx';
import { authServiceStub } from '../auth/auth.service.stub.spec';
import { responseHandlerStub } from './response-handler.service.stub.spec';

describe('http client test', () => {

  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  const samplePromise = (resolve, reject) => {
    resolve({data: '' })
  }
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: IbAuthService, useValue: authServiceStub},
        { provide: IbResponseHandlerService, useValue: responseHandlerStub},
        { provide: HTTP, useValue: {
          get: () => { return new Promise(samplePromise) },
          put: () => { return new Promise(samplePromise) },
          post: () => { return new Promise(samplePromise) },
          delete: () => { return new Promise(samplePromise) },
        }},
        IbHttpClientService
      ]
    }).compileComponents();
    httpClient = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
    const svHttpClientService = TestBed.get(IbHttpClientService);
    svHttpClientService.httpMode = 'NORMAL';
    svHttpClientService.hMobile = null
  });

  it('Should be created', () => {
    const svHttpClientService = TestBed.get(IbHttpClientService);
    expect(svHttpClientService).toBeTruthy();
  });

  it('Should be use setAuthType', () => {
    const svHttpClientService = TestBed.get(IbHttpClientService);
    svHttpClientService.setAuthtype(AuthTypes.JWT);
    expect(svHttpClientService.authType).toBe(1);
  });

  it('createAuthorizationHeader', () => {
    const svHttpClientService = TestBed.get(IbHttpClientService);
    svHttpClientService.setAuthtype(AuthTypes.BASIC_AUTH);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
    svHttpClientService.setAuthtype(AuthTypes.JWT);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
    svHttpClientService.setAuthtype(null);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));

    svHttpClientService.httpMode = 'MOBILE';
    svHttpClientService.setAuthtype(AuthTypes.BASIC_AUTH);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
    svHttpClientService.setAuthtype(AuthTypes.JWT);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
    svHttpClientService.setAuthtype(null);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
  });

  it('createAuthorizationHeader', () => {
    authServiceStub.activeSession = null;
    const svHttpClientService = TestBed.get(IbHttpClientService);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
  });

  it('should use turnOffModal with pendind Request > 0', () => {
    const svHttpClientService = TestBed.get(IbHttpClientService);
    const spyModal = spyOn(svHttpClientService, 'turnOffModal');
    const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
    const testData = {name: 'Test Data'};
    svHttpClientService.pendingRequests = 10;
    svHttpClientService.put('/ciao/put')
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


  runTestCase('get')
  runTestCase('post')
  runTestCase('put')
  runTestCase('delete')




  function runTestCase(method){

    it(`should use ${method}`, (done) => {
      const svHttpClientService = TestBed.get(IbHttpClientService);
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
      const httpMobile = TestBed.get(HTTP);
      svHttpClientService.hMobile = httpMobile
      svHttpClientService[method]('/ciao/').subscribe(
        (data) => {
          done()
        },
        (data) => {
          done()
        }
      )
    });

    it(`should use ${method} with null`, () => {
      const svHttpClientService = TestBed.get(IbHttpClientService);
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
      const svHttpClientService = TestBed.get(IbHttpClientService);
      svHttpClientService[method]('/ciao/')
        .subscribe((res: any) => {
          expect(res.failure.error.type).toBe('ERROR_' + method.toUpperCase());
          done();
        }, () => {
          console.log('error');
          done();
        });
      const getRequest = httpMock.expectOne('/ciao/');
      getRequest.error(new ErrorEvent('ERROR_'+method.toUpperCase()));
      httpMock.verify();


    });
  }

});


