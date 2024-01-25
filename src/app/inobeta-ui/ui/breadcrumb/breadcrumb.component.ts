import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type IbBreadcrumbItem = {
  label?: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'ib-breadcrumb',
  templateUrl: './breadcrumb.component.html',
})
export class IbBreadcrumbComponent implements OnInit {
  static readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';
  /**
   * Edit icon or label of the first crumb
   */
  @Input() home: IbBreadcrumbItem = {url: '/', icon: 'home'};
  @Input() items: IbBreadcrumbItem[] = [];
  /**
   * Whether create breadcrumbs looking up the routes (`auto`), or define them through the `items` input ('static')
   */
  @Input() mode: 'static' | 'auto';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    if (this.mode === 'static') {
      return;
    }
    this.items = this.createBreadcrumbs(this.activatedRoute.root);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.items = this.createBreadcrumbs(this.activatedRoute.root));
  }

  private createBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: IbBreadcrumbItem[] = []) {
    const children = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data[IbBreadcrumbComponent.ROUTE_DATA_BREADCRUMB];
      if (label) {
        breadcrumbs.push({label, url});
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }
}
