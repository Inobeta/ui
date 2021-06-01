import { of } from "rxjs";
import { Injectable } from "@angular/core";

@Injectable()
export class IbModalMessageServiceStub {
  show(){
    return of(true)
  }
}
