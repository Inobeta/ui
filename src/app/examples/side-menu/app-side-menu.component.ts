import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface AppSideMenuLink {
  readonly label: string;
  readonly route: string;
}

interface AppSideMenuGroup {
  readonly id: string;
  readonly linksId: string;
  readonly label: string;
  readonly icon: string;
  readonly links: readonly AppSideMenuLink[];
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
  ],
  templateUrl: './app-side-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app-side-menu.component.css'],
})
export class AppSideMenuComponent {
  readonly groups: readonly AppSideMenuGroup[] = [
    {
      id: 'kai-table',
      linksId: 'kai-table-links',
      label: 'examples.sideMenu.kaiTable',
      icon: 'table_rows',
      links: [
        { label: 'examples.sideMenu.kaiTableSimple', route: '/home/kai-table/simple' },
        { label: 'examples.sideMenu.kaiTableParentHeight', route: '/home/kai-table/parent-height' },
        { label: 'examples.sideMenu.kaiTableContextAction', route: '/home/kai-table/actions' },
        { label: 'examples.sideMenu.kaiTableFull', route: '/home/kai-table/full' },
        { label: 'examples.sideMenu.kaiTableApi', route: '/home/kai-table/api' },
        { label: 'examples.sideMenu.kaiTableRouting', route: '/home/kai-table/with-routing' },
        { label: 'examples.sideMenu.kaiTableDatasource', route: '/home/kai-table/datasource' },
        { label: 'examples.sideMenu.kaiTableSticky', route: '/home/kai-table/sticky' },
        { label: 'examples.sideMenu.kaiTableStickyParent', route: '/home/kai-table/sticky-parent' },
        { label: 'examples.sideMenu.kaiTableCustomSortFilter', route: '/home/kai-table/custom-sort-filter' },
        { label: 'examples.sideMenu.kaiTableCustomAggregate', route: '/home/kai-table/custom-aggregate' },
        { label: 'examples.sideMenu.kaiTableColumnOptions', route: '/home/kai-table/column-options' },
        { label: 'examples.sideMenu.kaiTableMobileEmpty', route: '/home/kai-table/mobile-empty' },
      ],
    },
    {
      id: 'dialog',
      linksId: 'dialog-links',
      label: 'examples.sideMenu.dialog',
      icon: 'announcement',
      links: [{ label: 'examples.sideMenu.dialog', route: '/home/dialog' }],
    },
    {
      id: 'toast',
      linksId: 'toast-links',
      label: 'examples.sideMenu.toast',
      icon: 'breakfast_dining',
      links: [{ label: 'examples.sideMenu.toast', route: '/home/toast' }],
    },
  ];

  private readonly expandedGroups = signal<ReadonlySet<string>>(
    new Set(this.groups.map((group) => group.id)),
  );

  isGroupExpanded(group: AppSideMenuGroup): boolean {
    return this.expandedGroups().has(group.id);
  }

  toggleGroup(group: AppSideMenuGroup): void {
    const expandedGroups = new Set(this.expandedGroups());

    if (expandedGroups.has(group.id)) {
      expandedGroups.delete(group.id);
    } else {
      expandedGroups.add(group.id);
    }

    this.expandedGroups.set(expandedGroups);
  }
}
