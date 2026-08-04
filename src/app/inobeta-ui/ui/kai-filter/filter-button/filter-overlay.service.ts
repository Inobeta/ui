import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterOverlayService {
  closeRequested = new BehaviorSubject<boolean>(false);

  requestClose() {
    this.closeRequested.next(true);
  }
}
