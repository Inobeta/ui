import * as actions from './session.actions';
import { sessionReducer } from './session.reducer';
import { async } from '@angular/core/testing';

describe('sessionReducer', () => {

  let MOCK_INITIAL_STATE_EMPTY = {
    activeSession: null
  };

  beforeEach(async(() => {
    MOCK_INITIAL_STATE_EMPTY = {
      activeSession: null
    };
  }));


  it('login/logout', () => {
    let state = sessionReducer(undefined, actions.login({
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


    state = sessionReducer({
      ...state
    }, actions.logout);
    expect(state.activeSession).toEqual(null);
  });



  it('changeNameSurname', () => {
    const state = sessionReducer({
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
