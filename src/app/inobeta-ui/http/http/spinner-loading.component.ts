import {Component, ViewEncapsulation} from '@angular/core';
import {IbHttpClientService} from './http-client.service';

@Component({
  selector: 'ib-spinner-loading',
  styles: [`
    .spinner {
      width: 40px;
      height: 40px;
      position: relative;
      margin: auto;
      top: 50%;
    }

    .double-bounce1, .double-bounce2 {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #333;
      opacity: 0.6;
      position: absolute;
      top: 0;
      left: 0;
      -webkit-animation: sk-bounce 1s infinite ease-in-out;
      animation: sk-bounce 1s infinite ease-in-out;
    }

    .double-bounce2 {
      -webkit-animation-delay: -1.0s;
      animation-delay: -1.0s;
    }

    @-webkit-keyframes sk-bounce {
      0%, 100% {
        -webkit-transform: scale(0.0)
      }
      50% {
        -webkit-transform: scale(1.0)
      }
    }

    @keyframes sk-bounce {
      0%, 100% {
        transform: scale(0.0);
        -webkit-transform: scale(0.0);
      }
      50% {
        transform: scale(1.0);
        -webkit-transform: scale(1.0);
      }
    }

    .modal-spinner {
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.4);
    }
  `],
  template: `
    <div *ngIf="this.httpService.showLoading" [hidden]="!this.httpService.showLoading" class="modal-spinner">
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
    </div>`,
  encapsulation: ViewEncapsulation.None
})

export class IbSpinnerLoadingComponent {
  constructor(public httpService: IbHttpClientService) {}
}

/* istanbul ignore next */
