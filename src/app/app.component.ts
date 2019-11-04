import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ib-root',
  template: `
    <p routerLink="/tabExample">esempio tab</p>
    <router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  ngOnInit() {}
}
