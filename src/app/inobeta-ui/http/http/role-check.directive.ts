import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { IbLoginService } from "../auth/login.service";
import { IbAPITokens } from "../auth/session.model";

@Directive({
  selector: "[ibRoleCheck]",
  standalone: true,
})
export class IbRoleCheckDirective implements OnInit, OnDestroy {
  @Input("ibRoleCheck") roles: string[];
  destroy: Subject<void> = new Subject();

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private login: IbLoginService<IbAPITokens>
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.login
      .hasRoles(this.roles)
      .pipe(takeUntil(this.destroy))
      .subscribe((hasRole) => {
        this.vcr.clear();
        if (hasRole) {
          this.vcr.createEmbeddedView(this.tpl);
        }
      });
  }
}
