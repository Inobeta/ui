import {TestBed} from '@angular/core/testing';
import {IbResponseHandlerService} from './response-handler.service';

describe('response handler test', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        IbResponseHandlerService
      ]
    }).compileComponents();
  });

  it('Should be created', () => {
    const svcResponseHandler = TestBed.inject(IbResponseHandlerService);
    expect(svcResponseHandler).toBeTruthy();
  });

  it('Should use handle Ok (else)', () => {
    const svcResponseHandler = TestBed.inject(IbResponseHandlerService);
    svcResponseHandler.handleOK({});
  });

});
