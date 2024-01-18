import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "ib-root",
  template: `<router-outlet *ngIf="translateLoaded"></router-outlet> `,
})
export class AppComponent implements OnInit {
  translateLoaded = false;
  ngOnInit() {}

  constructor(private translateService: TranslateService) {
    this.translateService.setDefaultLang("it");
    this.translateService.use("it").subscribe(() => {
      this.translateLoaded = true;
    });
  }
}
