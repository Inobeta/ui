export let mockCookiesStorage = {
  empty: true,
  get: jasmine.createSpy('cook get Spy').and.callFake(() => {
    if (mockCookiesStorage.empty) {
      return null;
    } else {
      return {
        user: {
          username: 'prova',
          password: 'prova',
          rememberMe: true
        },
        userData: {
          prova: 'prova'
        },
        valid: true,
        authToken: 'ufwehliruui'
      };
    }
  }),
  set: jasmine.createSpy('cook set Spy').and.callFake(() => {
    return true;
  })
};

export let mockLocalStorage = {
  empty: true,
  get: jasmine.createSpy('loc get Spy').and.callFake(() => {
    if (mockLocalStorage.empty) {
      return null;
    } else {
      return {
        user: {
          username: 'prova',
          password: 'prova',
          rememberMe: true
        },
        userData: {
          prova: 'prova'
        },
        valid: true,
        authToken: 'ufwehliruui'
      };
    }
  }),
  set: jasmine.createSpy('loc set Spy').and.callFake(() => {
    return true;
  })
};

export let mockAuthService = {
  isNull: true,
  activeSession: this.isNull ? null : 'user'
};
