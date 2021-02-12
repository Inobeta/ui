import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {AuthService} from '../auth/auth.service';
import {HttpClientService} from './httpclient.service';
import {ResponseHandlerService} from './responseHandler.service';
import {AuthTypes} from '../auth/session.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {throwError} from 'rxjs';

describe('http client test', () => {
  const mockAuthService = {
    activeSession: 'prova',
    storeSession: jasmine.createSpy('storeSession spy').and.callFake(() => {
      return true;
    }),
    cookieSession: jasmine.createSpy('cookieSession spy').and.callFake(() => {
      return true;
    })
  };
  const mockResponseHandler = {
    displayErrors: jasmine.createSpy('displayErrors spy').and.callFake(() => {
      return Object({ name: 'Test Data' });
    }),
    handleOK: jasmine.createSpy('handleOK spy').and.callFake(() => {
      return Object({ name: 'Test Data' });
    }),
    handleKO: jasmine.createSpy('handleKO spy').and.callFake(() => {
      return throwError('an error');
    })
  };
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService},
        { provide: ResponseHandlerService, useValue: mockResponseHandler},
        HttpClientService
      ]
    }).compileComponents();
    httpClient = TestBed.get(HttpClient);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('Should be created', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    expect(svHttpClientService).toBeTruthy();
  });

  it('Should be use setAuthType', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    svHttpClientService.setAuthtype(AuthTypes.JWT);
    expect(svHttpClientService.authType).toBe(1);
  });

  it('createAuthorizationHeader', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
    svHttpClientService.setAuthtype(AuthTypes.JWT);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
    svHttpClientService.setAuthtype(null);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
  });

  it('createAuthorizationHeader', () => {
    mockAuthService.activeSession = null;
    const svHttpClientService = TestBed.get(HttpClientService);
    svHttpClientService.createAuthorizationHeader(new HttpHeaders('prova: prova'));
  });

  it('should use get', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    const spyModal = spyOn(svHttpClientService, 'turnOffModal');
    const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
    const testData = {name: 'Test Data'};
    // Make an HTTP GET request
    svHttpClientService.get('/ciao/get')
      .subscribe(data =>
        // When observable resolves, result should match test data
        expect(data).toEqual(testData)
      );

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpMock.expectOne('/ciao/get');

    // Assert that the request is a GET.
    expect(req.request.method).toEqual('GET');

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(testData);

    // Finally, assert that there are no outstanding requests.
    httpMock.verify();
    expect(spyModal).toHaveBeenCalled();
    expect(spyHead).toHaveBeenCalled();
    expect(mockResponseHandler.handleOK).toHaveBeenCalled();
  });

  it('should use get FAIL', (done) => {
    const svHttpClientService = TestBed.get(HttpClientService);
    svHttpClientService.get('/ciao/get')
      .subscribe((res: any) => {
        expect(res.failure.error.type).toBe('ERROR_GET');
        done();
      }, () => {
        console.log('error');
        done();
      });
    const getRequest = httpMock.expectOne('/ciao/get');
    getRequest.error(new ErrorEvent('ERROR_GET'));
    httpMock.verify();
    expect(mockResponseHandler.displayErrors).toHaveBeenCalled();
    expect(mockResponseHandler.handleKO).toHaveBeenCalled();
  });

  it('should use delete', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    const spyModal = spyOn(svHttpClientService, 'turnOffModal');
    const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
    const testData = {name: 'Test Data'};
    svHttpClientService.delete('/ciao/delete')
      .subscribe(data =>
        expect(data).toEqual(testData)
      );
    const req = httpMock.expectOne('/ciao/delete');
    expect(req.request.method).toEqual('DELETE');
    req.flush(testData);
    httpMock.verify();
    expect(spyModal).toHaveBeenCalled();
    expect(spyHead).toHaveBeenCalled();
    expect(mockResponseHandler.handleOK).toHaveBeenCalled();
  });

  it('should use delete FAIL', (done) => {
    const svHttpClientService = TestBed.get(HttpClientService);
    svHttpClientService.delete('/ciao/delete')
      .subscribe((res: any) => {
        expect(res.failure.error.type).toBe('ERROR_DELETE');
        done();
      }, () => {
        console.log('error');
        done();
      });
    const getRequest = httpMock.expectOne('/ciao/delete');
    getRequest.error(new ErrorEvent('ERROR_DELETE'));
    httpMock.verify();
    expect(mockResponseHandler.displayErrors).toHaveBeenCalled();
    expect(mockResponseHandler.handleKO).toHaveBeenCalled();
  });

  it('should use put', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    const spyModal = spyOn(svHttpClientService, 'turnOffModal');
    const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
    const testData = {name: 'Test Data'};
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
    expect(mockResponseHandler.handleOK).toHaveBeenCalled();
  });

  it('should use put with null', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
    const spyModal = spyOn(svHttpClientService, 'turnOffModal');
    const spyHead = spyOn(svHttpClientService, 'createAuthorizationHeader');
    const testData = null;
    svHttpClientService.put('/ciao/put')
      .subscribe(data =>
        expect(data).toEqual(Object({ name: 'Test Data' }))
      );
    const req = httpMock.expectOne('/ciao/put');
    expect(req.request.method).toEqual('PUT');
    req.flush(testData);
    httpMock.verify();
    expect(spyModal).toHaveBeenCalled();
    expect(spyHead).toHaveBeenCalled();
    expect(mockResponseHandler.handleOK).toHaveBeenCalled();
  });

  it('should use put FAIL', (done) => {
    const svHttpClientService = TestBed.get(HttpClientService);
    svHttpClientService.put('/ciao/put')
      .subscribe((res: any) => {
        expect(res.failure.error.type).toBe('ERROR_PUT');
        done();
      }, () => {
        console.log('error');
        done();
      });
    const getRequest = httpMock.expectOne('/ciao/put');
    getRequest.error(new ErrorEvent('ERROR_PUT'));
    httpMock.verify();
    expect(mockResponseHandler.displayErrors).toHaveBeenCalled();
    expect(mockResponseHandler.handleKO).toHaveBeenCalled();
  });

  it('should use turnOffModal with pendind Request > 0', () => {
    const svHttpClientService = TestBed.get(HttpClientService);
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
    expect(mockResponseHandler.handleOK).toHaveBeenCalled();
  });

});
