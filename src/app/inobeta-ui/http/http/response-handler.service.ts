import {Injectable} from '@angular/core';
// import {NotificationService} from '../../modules/UIKit/components/toastNotification/notification.service';
import {Observable, throwError} from 'rxjs';
import {HttpEvent} from '@angular/common/http';

@Injectable()
export class IbResponseHandlerService {

  disableGlobalErrors = false;

  constructor(
  //  private srvNotify: NotificationService
  ) {}

  handleOK(res: Object) {
    if (res) {
      return res;
      /*
      TODO: handle resp formats
      if (data.rsp_code != 0) {
        throw data.rsp_msg;
      } else {
        return data.rsp_data;
      }*/
    } else {
      throw new Error('Unable to make request with server.');
    }
  }

  handleKO(res: HttpEvent<object> | any) {
    return throwError(res);
  }


  displayErrors(errMsg) {
//    if(!this.disableGlobalErrors)
//      this.srvNotify.add({severity: 'error', summary: 'Error', detail: errMsg});
  }
}
