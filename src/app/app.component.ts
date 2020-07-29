import {Component, OnInit} from '@angular/core';
import 'hammerjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'ib-root',
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  ngOnInit() {}

  constructor(
    private translateService: TranslateService) {
    this.translateService.setDefaultLang('it');
    this.translateService.use('it');
  }

}
