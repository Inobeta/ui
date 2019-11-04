import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'ib-root',
  template: `
    <a routerLink="/tabExample">esempio tab</a>
    <a routerLink="/login">login</a>
    <router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  ngOnInit() {}
}
