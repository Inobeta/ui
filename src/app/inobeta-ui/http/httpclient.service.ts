import {Injectable} from '@angular/core';
import {ResponseHandlerService} from './responseHandler.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';
import {AuthTypes} from '../auth/session.model';

/*
  HttpClient with Bearer authentication
 */
@Injectable()
export class HttpClientService {

  public pendingRequests = 0;
  public showLoading = false;
  private authType = AuthTypes.JWT;
  public additionalHeaders: any[] = [];

  constructor(
    protected h: HttpClient,
    private srvAuth: AuthService,
    private srvResponse: ResponseHandlerService) {
  }

  public setAuthtype(type: AuthTypes) {
    this.authType = type;
  }

  /*public setAdditionalHeaders(headers: any[] = []) {}*/

  createAuthorizationHeader(headers: HttpHeaders) {
    this.turnOnModal();
    if (!this.srvAuth.activeSession) {
      return;
    }
    let head = headers
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

  get(url): any {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.h.get(url, {headers})
      .pipe(
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );

  }

  post(url, data): any {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.h.post(url, data, {headers})
      .pipe(
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
  }

  put(url, data): any {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.h.put(url, data, {headers})
      .pipe(
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
  }

  delete(url): any {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.h.delete(url, {headers})
      .pipe(
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
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


