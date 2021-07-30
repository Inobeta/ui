import {Injectable, Inject, Optional} from '@angular/core';
import {IbResponseHandlerService} from './response-handler.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {IbAuthService} from '../auth/auth.service';
import {IbAuthTypes} from '../auth/session.model';
import { from } from 'rxjs';

/*
  HttpClient with Bearer authentication
 */
@Injectable()
export class IbHttpClientService {

  public pendingRequests = 0;
  public showLoading = false;
  public authType = IbAuthTypes.JWT; // FIXME: this should be private
  public additionalHeaders: any[] = [];

  /**
   * @deprecated Mobile version deprecated
   */
  public httpMode = 'NORMAL'; // FIXME: this should be private

  constructor(
    public h: HttpClient,
    private srvAuth: IbAuthService,
    private srvResponse: IbResponseHandlerService,
    @Inject('HttpMode') @Optional() public HttpMode?: string,
    /**
   * @deprecated Mobile version deprecated
   */
    @Inject('hMobile') @Optional() public hMobile?, // FIXME: this should be protected
    @Inject('ibHttpUrlExcludedFromLoader') @Optional() public ibHttpUrlExcludedFromLoader?: IbHttpRequestDefinition[],
    ) {
      this.httpMode = HttpMode || 'NORMAL';
      if(HttpMode !== 'NORMAL') {
        console.warn('Mobile version deprecated')
      }
      this.ibHttpUrlExcludedFromLoader = this.ibHttpUrlExcludedFromLoader || [];
  }

  public setAuthtype(type: IbAuthTypes) {
    this.authType = type;
  }

  /*public setAdditionalHeaders(headers: any[] = []) {}*/

  createAuthorizationHeader(req: IbHttpRequestDefinition = { url: null, method: null }, responseType = null) {
    this.turnOnModal(!this.ibHttpUrlExcludedFromLoader
                          .find(u => u.url.toUpperCase() === req.url.toUpperCase() && u.method.toUpperCase() === req.method.toUpperCase())
    );
    if (!this.srvAuth.activeSession) {
      return;
    }
    switch (this.httpMode) {
      case 'MOBILE':
        const mobileHeaders = {};
        mobileHeaders['Content-Type'] = 'application/json';
        mobileHeaders['x-requested-with'] = 'XMLHttpRequest';
        if (this.authType === IbAuthTypes.BASIC_AUTH) {
          mobileHeaders['Authorization'] = 'Basic ' + this.srvAuth.activeSession.authToken;
        } else if (this.authType === IbAuthTypes.JWT) {
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
        if (responseType) {
          return head.set('responseType', responseType);
        }
        if (this.authType === IbAuthTypes.BASIC_AUTH) {
          return head.set('Authorization', 'Basic ' + this.srvAuth.activeSession.authToken);
        } else if (this.authType === IbAuthTypes.JWT) {
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

  get(url, data = null, responseType = null): any {
    const headers = this.createAuthorizationHeader({ url, method: 'GET' }, responseType);
    return this.getObservableFromMode('get', url, data, headers)
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

  post(url, data, responseType = null): any {
    const headers = this.createAuthorizationHeader({ url, method: 'POST' }, responseType);
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

  put(url, data, responseType = null): any {
    const headers = this.createAuthorizationHeader({ url, method: 'PUT' }, responseType);
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

  delete(url, responseType = null): any {
    const headers = this.createAuthorizationHeader({ url, method: 'DELETE' }, responseType);
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
          case 'get': obs = from(this.hMobile.get(url, data, headers)); break;
          case 'post': obs = from(this.hMobile.post(url, data, headers)); break;
          case 'put': obs = from(this.hMobile.put(url, data, headers)); break;
          case 'delete': obs = from(this.hMobile.delete(url, null, headers)); break;
        }
        break;
      default:
        switch (method) {
          case 'get': obs = this.h.get(url, {headers, ...data}); break;
          case 'post': obs = this.h.post(url, data, {headers}); break;
          case 'put': obs = this.h.put(url, data, {headers}); break;
          case 'delete': obs = this.h.delete(url, {headers}); break;
        }
    }
    return obs;
  }



  public turnOnModal(enableLoader = true) {
    if (this.pendingRequests === 0) {
      this.showLoading = enableLoader;
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


export interface IbHttpRequestDefinition {
  url: string;
  method: string;
}

