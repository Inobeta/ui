import {Injectable} from '@angular/core';
import {ResponseHandlerService} from './responseHandler.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {AuthService} from '../auth/auth.service';


/*
  HttpClient with Bearer authentication
 */
@Injectable()
export class HttpClientService {
  public pendingRequests = 0;
  public showLoading = false;


  constructor(
    protected h: HttpClient,
    private srvAuth: AuthService,
    private srvResponse: ResponseHandlerService
  ) {
  }

  createAuthorizationHeader(headers: HttpHeaders) {
    this.turnOnModal();

    if (!this.srvAuth.activeSession) {
      return;
    }

    return headers
      .set('Content-Type', 'application/json')
      .set('x-requested-with', 'XMLHttpRequest')
      .set('Authorization', 'Basic ' + this.srvAuth.activeSession.authToken);


  }


  get(url): any {
    let headers = new HttpHeaders();
    headers = this.createAuthorizationHeader(headers);
    return this.h.get(url, {headers: headers})
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
    return this.h.post(url, data, {headers: headers})
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
    return this.h.put(url, data, {headers: headers})
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
    return this.h.delete(url, {headers: headers})
      .pipe(
        map(x => this.srvResponse.handleOK(x)),
        catchError(x => this.srvResponse.handleKO(x)),
        finalize(() => this.turnOffModal()),
        tap(x => x, err => this.srvResponse.displayErrors(err))
      );
  }


  private turnOnModal() {
    if (this.pendingRequests === 0) {
      this.showLoading = true;
    }
    this.pendingRequests += 1;
  }

  private turnOffModal() {
    this.pendingRequests -= 1;
    if (this.pendingRequests <= 0) {
      this.showLoading = false;
    }
  }
}

/* istanbul ignore next */

