import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ib-table-landing',
  template: `
  <nav>
    <ul fxLayout="row" fxLayoutGap="10px">
  <a href="javascript:void(0);" routerLink="./redux" routerLinkActive="active-link">With redux</a>
  <a href="javascript:void(0);" routerLink="./noredux" routerLinkActive="active-link">Without redux</a>
  </ul>
  </nav>
  <router-outlet></router-outlet>
  `
})

export class IbTableLandingComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}
