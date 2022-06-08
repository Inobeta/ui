import {Injectable} from '@angular/core';
// import {NotificationService} from '../../modules/UIKit/components/toastNotification/notification.service';
import {Observable, throwError} from 'rxjs';
import {HttpEvent} from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class IbResponseHandlerService {

  disableGlobalErrors = false;

  constructor(
  //  private srvNotify: NotificationService
  ) {}

  handleOK(res: Object) {
    return res;
  }

  handleKO(res: HttpEvent<object> | any) {
    return throwError(res);
  }


  displayErrors(errMsg) {
//    if(!this.disableGlobalErrors)
//      this.srvNotify.add({severity: 'error', summary: 'Error', detail: errMsg});
  }
}
