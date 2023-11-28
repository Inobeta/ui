import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { IbAPITokens, IbUserLogin } from "./session.model";


@Injectable({providedIn: 'root'})
export class IbLoginServiceStub<T extends IbAPITokens | IbAPITokens > {

  login (u: IbUserLogin): Observable<T>{
    return of({
      accessToken: '',
      refreshToken: ''
    }) as Observable<T>
  }

  logout() {
  }

}
