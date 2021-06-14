import * as actions from './session.actions';
import { ibSessionReducer } from './session.reducer';
import { waitForAsync } from '@angular/core/testing';

describe('ibSessionReducer', () => {

  let MOCK_INITIAL_STATE_EMPTY = {
    activeSession: null
  };

  beforeEach(waitForAsync(() => {
    MOCK_INITIAL_STATE_EMPTY = {
      activeSession: null
    };
  }));


  it('login/logout', () => {
    let state = ibSessionReducer(undefined, actions.login({
      activeSession: {
        user: null,
        authToken: '123',
        userData: {},
        valid: true
      }
    }));
    expect(state.activeSession).toEqual({
      user: null,
      authToken: '123',
      userData: {},
      valid: true
    });


    state = ibSessionReducer({
      ...state
    }, actions.logout);
    expect(state.activeSession).toEqual(null);
  });



  it('changeNameSurname', () => {
    const state = ibSessionReducer({
      activeSession: {
        user: null,
        authToken: '123',
        userData: {
          name: 'Carmelo',
          surname: 'Pappalardo'
        },
        valid: true
      }
    }, actions.changeNameSurname({
      name: 'Ignazio',
      surname: 'Patane'
    }));
    expect(state.activeSession.userData.name).toEqual('Ignazio');
    expect(state.activeSession.userData.surname).toEqual('Patane');

  });


});
