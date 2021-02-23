import { TestBed } from '@angular/core/testing';

import { IbFormControlService } from './form-control.service';

describe('IbFormControlService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [IbFormControlService]
  }));

  it('should be created', () => {
    const service: IbFormControlService = TestBed.get(IbFormControlService);
    expect(service).toBeTruthy();
  });
});
