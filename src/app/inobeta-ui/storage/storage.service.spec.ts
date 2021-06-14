import { TestBed } from '@angular/core/testing';
import { IbStorageService, IbStorageTypes } from './storage.service';

describe('IbStorageService', () => {
  let storageService: IbStorageService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        IbStorageService
      ]
    }).compileComponents();
    storageService = TestBed.inject(IbStorageService);
  });

  it('should be created', () => {
    expect(storageService).toBeTruthy();
  });



  it('should set localstorage and cookies', () => {
    const spyLocal = spyOn(localStorage, 'setItem').and.callFake(() => {});
    storageService.set('test', {some: 'object'});
    expect(spyLocal).toHaveBeenCalled();
    spyLocal.calls.reset();
    storageService.set('test', {some: 'object'}, IbStorageTypes.COOKIESTORAGE);
    expect(spyLocal).not.toHaveBeenCalled();
  });



  it('should get localstorage and cookies', () => {
    const spyLocal = spyOn(localStorage, 'getItem').and.callFake(() => null);
    storageService.get('test');
    expect(spyLocal).toHaveBeenCalled();
    spyLocal.calls.reset();
    storageService.get('missing-key', IbStorageTypes.COOKIESTORAGE);
    expect(spyLocal).not.toHaveBeenCalled();
    storageService.set('test', {some: 'object'}, IbStorageTypes.COOKIESTORAGE);
    storageService.get('test', IbStorageTypes.COOKIESTORAGE);
    expect(spyLocal).not.toHaveBeenCalled();
    document.cookie = '';
  });
});
