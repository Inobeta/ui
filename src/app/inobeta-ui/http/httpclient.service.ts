import {Injectable, Inject, Optional} from '@angular/core';
import {ResponseHandlerService} from './responseHandler.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {AuthTypes} from '../auth/session.model';
import { HTTP } from '@ionic-native/http/ngx';
import { from } from 'rxjs';

/*
  HttpClient with Bearer authentication
 */
@Injectable()
export class HttpClientService {

  public pendingRequests = 0;
  public showLoading = false;
  private authType = AuthTypes.JWT;
  public additionalHeaders: any[] = [];

  private httpMode = 'NORMAL';

  constructor(
    protected h: HttpClient,
    private srvAuth: AuthService,
    private srvResponse: ResponseHandlerService,
    @Inject('HttpMode') @Optional() public HttpMode?: string,
    @Inject('hMobile') @Optional() protected hMobile?: HTTP) {
      this.httpMode = HttpMode || 'NORMAL';
  }

  public setAuthtype(type: AuthTypes) {
    this.authType = type;
  }

  /*public setAdditionalHeaders(headers: any[] = []) {}*/

  createAuthorizationHeader() {
    this.turnOnModal();
    if (!this.srvAuth.activeSession) {
      return;
    }
    switch (this.httpMode) {
      case 'MOBILE':
        const mobileHeaders = {};
        mobileHeaders['Content-Type'] = 'application/json';
        mobileHeaders['x-requested-with'] = 'XMLHttpRequest';
        if (this.authType === AuthTypes.BASIC_AUTH) {
          mobileHeaders['Authorization'] = 'Basic ' + this.srvAuth.activeSession.authToken;
        } else if (this.authType === AuthTypes.JWT) {
          mobileHeaders['Authorization'] = 'Bearer ' + this.srvAuth.activeSession.authToken;
        } else {
          if (this.additionalHeaders.length) {
            for (const elem of this.additionalHeaders) {
              mobileHeaders[elem.key] = elem.value;
            }
          }
        }
        return mobileHeaders;
      default:
        let head = (new HttpHeaders())
          .set('Content-Type', 'application/json')
          .set('x-requested-with', 'XMLHttpRequest');
        if (this.authType === AuthTypes.BASIC_AUTH) {
          return head.set('Authorization', 'Basic ' + this.srvAuth.activeSession.authToken);
        } else if (this.authType === AuthTypes.JWT) {
          return head.set('Authorization', 'Bearer ' + this.srvAuth.activeSession.authToken);
        } else {
          if (this.additionalHeaders.length) {
            for (const elem of this.additionalHeaders) {
              head = head.set(elem.key, elem.value);
            }
          }
        }
        return head;

    }
  }

  get(url, responseType  = null): any {
    const headers = this.createAuthorizationHeader();
    const dataHead = {headers};
    if (responseType != null) {
      dataHead['responseType'] = responseType;
    }
    return this.getObservableFromMode('get', url, null, headers)
      .pipe(
        map(val => {
          if (this.httpMode === 'MOBILE') {
            return (val['data']) ? JSON.parse(val['data']) : '';
          }
          return val;
        }),
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );

  }

  post(url, data): any {
    const headers = this.createAuthorizationHeader();
    return this.getObservableFromMode('post', url, data, headers)
      .pipe(
        map(val => {
          if (this.httpMode === 'MOBILE') {
            return (val['data']) ? JSON.parse(val['data']) : '';
          }
          return val;
        }),
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
  }

  put(url, data): any {
    const headers = this.createAuthorizationHeader();
    return this.getObservableFromMode('put', url, data, headers)
      .pipe(
        map(val => {
          if (this.httpMode === 'MOBILE') {
            return (val['data']) ? JSON.parse(val['data']) : '';
          }
          return val;
        }),
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
  }

  delete(url): any {
    const headers = this.createAuthorizationHeader();
    return this.getObservableFromMode('delete', url, null, headers)
      .pipe(
        map(val => {
          if (this.httpMode === 'MOBILE') {
            return (val['data']) ? JSON.parse(val['data']) : '';
          }
          return val;
        }),
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
  }

  private getObservableFromMode(method, url, data, headers) {
    let obs = null;
    switch (this.httpMode) {
      case 'MOBILE':
        switch (method) {
          case 'get': obs = from(this.hMobile.get(url, null, headers)); break;
          case 'post': obs = from(this.hMobile.post(url, data, headers)); break;
          case 'put': obs = from(this.hMobile.put(url, data, headers)); break;
          case 'delete': obs = from(this.hMobile.delete(url, null, headers)); break;
        }
        break;
      default:
        switch (method) {
          case 'get': obs = this.h.get(url, headers); break;
          case 'post': obs = this.h.post(url, data, {headers}); break;
          case 'put': obs = this.h.put(url, data, {headers}); break;
          case 'delete': obs = this.h.delete(url, {headers}); break;
        }
    }
    return obs;
  }



  public turnOnModal() {
    if (this.pendingRequests === 0) {
      this.showLoading = true;
    }
    this.pendingRequests += 1;
  }

  public turnOffModal() {
    this.pendingRequests -= 1;
    if (this.pendingRequests <= 0) {
      this.showLoading = false;
    }
  }
}


