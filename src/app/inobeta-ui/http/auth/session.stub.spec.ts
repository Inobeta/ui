import {of} from 'rxjs';
import {fixtures} from './session.fixture.spec';
import {authServiceStub} from './auth.service.stub.spec';
export const sessionServiceStub = {

  setAuthtype: () => {
    return true;
  },

  login: () => {
      authServiceStub.storeSession();
      return of(fixtures.login);
  },

  logout: () => {
  }

};
