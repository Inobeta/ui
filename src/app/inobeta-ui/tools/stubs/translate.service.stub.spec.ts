import {of} from 'rxjs';

export const translateServiceStub = {
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
