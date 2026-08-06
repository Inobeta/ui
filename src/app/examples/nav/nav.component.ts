import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AppSideMenuComponent } from '../side-menu/app-side-menu.component';

const MOBILE_BREAKPOINT = '(max-width: 767px)';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    AppSideMenuComponent,
    MatIconButton,
    MatIconModule,
    MatSidenavModule,
    RouterOutlet,
    TranslatePipe,
  ],
})
export class NavComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(this.breakpointObserver.isMatched(MOBILE_BREAKPOINT));
  readonly drawerMode = computed<MatDrawerMode>(() => this.isMobile() ? 'over' : 'side');
  drawerOpened = !this.isMobile();

  constructor() {
    this.breakpointObserver.observe(MOBILE_BREAKPOINT)
      .pipe(takeUntilDestroyed())
      .subscribe(({ matches }) => {
        this.isMobile.set(matches);
        this.drawerOpened = !matches;
      });
  }
}
