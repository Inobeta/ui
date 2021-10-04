import { Component, Input } from '@angular/core';
import { IbMainMenuButton } from 'public_api';

@Component({
  selector: 'ib-main-menu-header-footer-buttons',
  template: `
  <ng-container>
    <div
      routerLink="{{ ( element.link === undefined) ? null : element.link }}"
      routerLinkActive
      #rla="routerLinkActive"
      style="display: none;"
    >
    </div>

    <!-- topCenter button ------------->
    <div
      *ngIf="type === 'topCenter'"
      id="ib-main-menu-expanded-header-closeButton-wrapper"
      fxLayout="row"
      fxLayoutAlign="space-around center">
      <button mat-button>
        <div
          fxLayout="row"
          fxLayoutAlign="space-evenly center">
          <mat-icon>
            {{element.icon}}
          </mat-icon>
          <p>
            {{ element.label | translate }}
          </p>
        </div>
      </button>
    </div>

    <!-- upRight button ------------->
    <button
      *ngIf="type === 'upRight'"
      mat-button
      class="{{(rla.isActive && element.link !== undefined)? 'active-header-footer-button upRight-button': 'upRight-button'}}"
    >
      <mat-icon>
        {{element.icon}}
      </mat-icon>
    </button>

    <!-- bottomLeft button --------->
    <button
      *ngIf="type === 'bottomLeft'"
      mat-button
      id="ib-main-menu-expanded-footer-support-button"
      class="{{(rla.isActive && element.link !== undefined)? 'active-header-footer-button': null}}"
    >
      <div
        id="ib-main-menu-expanded-footer-support-button-wrapper"
        fxLayout="row"
        fxLayoutAlign="center center"
      >
        <mat-icon>
          {{element.icon}}
        </mat-icon>
        <p>
          {{element.label | translate}}
        </p>
      </div>
    </button>

   </ng-container>
    `,
    styles: [`

    #ib-main-menu-expanded-header-closeButton-wrapper {
      width: 100%;
      margin: 0 auto;
    }

    #ib-main-menu-expanded-header-closeButton-wrapper button {
      min-width: 256px;
      max-width: 453px;
      height: 40px;
      border-radius: 20px;
      border-width: 1px;
      border-style: solid;
      transition: border-color .2s, box-shadow .2s;
    }

    #ib-main-menu-expanded-header-closeButton-wrapper button div{
      height: 38px;
    }

    #ib-main-menu-expanded-header-closeButton-wrapper button div p {
      margin: 0;
    }
    .upRight-button {
      min-width: 32px;
      max-width:32px;
      min-height: 32px;
      max-height: 32px;
      padding: 0px;
      border-radius: 8px;
      transition: background-color .2s;
    }

    .upRight-button mat-icon{
      font-size: 24px;
      min-width: 23px;
      max-width:23px;
      min-height: 25px;
      max-height: 25px;
      margin: 0px 1px 5px 0px;
    }

    #ib-main-menu-expanded-footer-support-button {
      width: 166px;
      height: 32px;
      border-radius: 8px;
      border-width: 1px;
      border-style: solid;
      padding:0px;
      transition: border-color .2s, box-shadow .2s;
    }

    #ib-main-menu-expanded-footer-support-button-wrapper {
      width: 164px;
      height: 28px;
    }

    #ib-main-menu-expanded-footer-support-button-wrapper p {
      font-size: 12px;
      margin: 0px 0px 4px 0px;
      height: 20px;
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
    }

    #ib-main-menu-expanded-footer-support-button-wrapper mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin: 0px 10px 0px 0px;
    }
    `]
})
export class IbMainMenuHeaderFooterButtonsComponent {
  @Input() type: string;
  @Input() element: IbMainMenuButton;

  constructor() {}
}
