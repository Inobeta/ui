import { throwError } from 'rxjs';

export const responseHandlerStub = {
  displayErrors: () => {
    return { name: 'Test Data' };
  },
  handleOK: (data) => {
    return data;
  },
  handleKO: () => {
    return throwError('an error');
  }
};
