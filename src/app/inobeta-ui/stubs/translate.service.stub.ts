import {of} from 'rxjs';

export const TranslateServiceStub = {
  get(key: any): any {
    return of(key);
  },
  setDefaultLang() {
    return true;
  },
  use() {
    return of({});
  }
};
