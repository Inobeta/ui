import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface IbBreadcrumbItem {
  label?: string;
  url?: string;
  icon?: string;
}

type IbBreadcrumbMode = 'static' | 'auto';

@Component({
  selector: 'ib-breadcrumb',
  templateUrl: './breadcrumb.component.html',
})
export class IbBreadcrumbComponent implements OnInit {
  static readonly ROUTE_DATA_BREADCRUMB = 'breadcrumb';
  /**
   * Modifica l'icona o label per il primo elemento.
   */
  @Input() home: IbBreadcrumbItem = {url: '/', icon: 'home'};
  @Input() items: IbBreadcrumbItem[] = [];
  /**
   * Modalità per il render delle breadcrumbs.
   * Di default, il percorso viene calcolato dalle routes. Per inserire le singole "briciole" usare la modalità `static`
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
