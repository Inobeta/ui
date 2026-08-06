import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AppSideMenuComponent } from './app-side-menu.component';

describe('AppSideMenuComponent', () => {
  let fixture: ComponentFixture<AppSideMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppSideMenuComponent,
        NoopAnimationsModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSideMenuComponent);
    fixture.detectChanges();
  });

  it('starts every group expanded', () => {
    const element = fixture.nativeElement as HTMLElement;
    const toggles = Array.from(
      element.querySelectorAll<HTMLButtonElement>('.side-menu-group-toggle'),
    );
    const linkGroups = Array.from(
      element.querySelectorAll<HTMLDivElement>('.side-menu-links'),
    );

    expect(toggles.length).toBe(3);
    expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
      'true',
      'true',
      'true',
    ]);
    expect(linkGroups.every((linkGroup) => !linkGroup.hidden)).toBeTrue();
  });

  it('hides and restores group links when its control is toggled', () => {
    const element = fixture.nativeElement as HTMLElement;
    const toggle = element.querySelector<HTMLButtonElement>('.side-menu-group-toggle')!;
    const linksId = toggle.getAttribute('aria-controls')!;
    const links = element.querySelector<HTMLDivElement>(`#${linksId}`)!;

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(links.hidden).toBeTrue();

    toggle.click();
    fixture.detectChanges();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(links.hidden).toBeFalse();
  });

  it('uses default Material icon font for group icons', () => {
    const element = fixture.nativeElement as HTMLElement;
    const icons = Array.from(
      element.querySelectorAll<HTMLElement>(
        '.side-menu-group-toggle mat-icon:not(.side-menu-expand-icon)',
      ),
    );

    expect(icons.map((icon) => icon.textContent?.trim())).toEqual([
      'table_rows',
      'announcement',
      'breakfast_dining',
    ]);
    expect(icons.every((icon) => icon.classList.contains('material-icons'))).toBeTrue();
  });

  it('renders all current route links', () => {
    const element = fixture.nativeElement as HTMLElement;
    const routes = Array.from(
      element.querySelectorAll<HTMLAnchorElement>('.side-menu-link'),
    ).map((link) => link.getAttribute('href'));

    expect(routes).toEqual([
      '/home/kai-table/simple',
      '/home/kai-table/parent-height',
      '/home/kai-table/actions',
      '/home/kai-table/full',
      '/home/kai-table/api',
      '/home/kai-table/with-routing',
      '/home/kai-table/datasource',
      '/home/kai-table/sticky',
      '/home/kai-table/sticky-parent',
      '/home/kai-table/custom-sort-filter',
      '/home/kai-table/custom-aggregate',
      '/home/kai-table/column-options',
      '/home/kai-table/mobile-empty',
      '/home/dialog',
      '/home/toast',
    ]);
  });
});
