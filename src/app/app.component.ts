
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "ib-root",
    template: `@if (translateLoaded) {<router-outlet></router-outlet>} `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
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
