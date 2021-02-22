import {TestBed} from '@angular/core/testing';
import {ResponseHandlerService} from './responseHandler.service';

describe('response handler test', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        ResponseHandlerService
      ]
    }).compileComponents();
  });

  it('Should be created', () => {
    const svcResponseHandler = TestBed.get(ResponseHandlerService);
    expect(svcResponseHandler).toBeTruthy();
  });

  it('Should use handle Ok (else)', () => {
    const svcResponseHandler = TestBed.get(ResponseHandlerService);
    svcResponseHandler.handleOK({});
  });

});
