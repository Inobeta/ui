import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'ib-root',
  template: `
    <router-outlet *ngIf="translateLoaded"></router-outlet>
    <ib-spinner-loading></ib-spinner-loading>
  `
})
export class AppComponent implements OnInit {
  translateLoaded = false;
  ngOnInit() {}

  constructor(
    private translateService: TranslateService) {
    this.translateService.setDefaultLang('it');
    this.translateService.use('it');
    this.translateService.reloadLang(this.translateService.currentLang).subscribe(() => {
      this.translateLoaded = true;
    })
  }

}
