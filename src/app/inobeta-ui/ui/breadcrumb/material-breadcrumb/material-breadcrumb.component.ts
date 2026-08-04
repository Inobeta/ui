import { Component } from '@angular/core';
import { IbBreadcrumbComponent } from '../breadcrumb.component';

@Component({
    selector: 'ib-material-breadcrumb',
    templateUrl: './material-breadcrumb.component.html',
    styleUrls: ['./material-breadcrumb.component.css'],
    standalone: false
})
/** @deprecated this component will be removed in v21 */
export class IbMaterialBreadcrumbComponent extends IbBreadcrumbComponent {}
