import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSidenavHarness } from '@angular/material/sidenav/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { NavComponent } from './nav.component';

class BreakpointObserverStub {
  private readonly state = new BehaviorSubject<BreakpointState>({
    matches: false,
    breakpoints: {},
  });

  isMatched(): boolean {
    return this.state.value.matches;
  }

  observe(): Observable<BreakpointState> {
    return this.state.asObservable();
  }

  setMatches(matches: boolean): void {
    this.state.next({ matches, breakpoints: {} });
  }
}

describe('NavComponent', () => {
  let fixture: ComponentFixture<NavComponent>;
  let breakpointObserver: BreakpointObserverStub;

  beforeEach(async () => {
    breakpointObserver = new BreakpointObserverStub();

    await TestBed.configureTestingModule({
      imports: [
        NavComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: BreakpointObserver, useValue: breakpointObserver }],
    }).compileComponents();
  });

  function createComponent(isMobile: boolean): void {
    breakpointObserver.setMatches(isMobile);
    fixture = TestBed.createComponent(NavComponent);
    fixture.detectChanges();
  }

  it('keeps desktop navigation open in side mode', async () => {
    createComponent(false);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const drawer = await loader.getHarness(MatSidenavHarness);

    expect(await drawer.getMode()).toBe('side');
    expect(await drawer.isOpen()).toBeTrue();
  });

  it('starts mobile navigation closed and toggles it from hamburger control', async () => {
    createComponent(true);
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const drawer = await loader.getHarness(MatSidenavHarness);
    const hamburger = await loader.getHarness(
      MatButtonHarness.with({ selector: '.mobile-navigation button' }),
    );

    expect(await drawer.getMode()).toBe('over');
    expect(await drawer.isOpen()).toBeFalse();

    await hamburger.click();
    expect(await drawer.isOpen()).toBeTrue();

    await hamburger.click();
    expect(await drawer.isOpen()).toBeFalse();
  });
});
