import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "ib-root",
  template: `<router-outlet *ngIf="translateLoaded"></router-outlet> `,
})
export class AppComponent {
  translateLoaded = false;

  constructor(private translateService: TranslateService) {
    this.translateService.setDefaultLang("it");
    this.translateService.use("it").subscribe(() => {
      this.translateLoaded = true;
    });
  }
}
