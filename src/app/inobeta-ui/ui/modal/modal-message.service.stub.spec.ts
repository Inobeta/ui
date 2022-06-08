import { of } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class IbModalMessageServiceStub {
  show(){
    return of(true)
  }
}
