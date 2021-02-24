import { throwError } from 'rxjs';

export const responseHandlerStub = {
  displayErrors: () => {
    return { name: 'Test Data' };
  },
  handleOK: () => {
    return { name: 'Test Data' };
  },
  handleKO: () => {
    return throwError('an error');
  }
};
