import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpEvent } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class IbResponseHandlerService {

  disableGlobalErrors = false;

  constructor() { }

  handleOK(res: Object) {
    return res;
  }

  handleKO(res: HttpEvent<object> | any) {
    return throwError(res);
  }


  displayErrors(errMsg) {
  }
}
