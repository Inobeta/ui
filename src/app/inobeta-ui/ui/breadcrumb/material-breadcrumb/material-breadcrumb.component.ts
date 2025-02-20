import { Component } from '@angular/core';
import { IbBreadcrumbComponent } from '../breadcrumb.component';

@Component({
    selector: 'ib-material-breadcrumb',
    templateUrl: './material-breadcrumb.component.html',
    styleUrls: ['./material-breadcrumb.component.css'],
    standalone: false
})
export class IbMaterialBreadcrumbComponent extends IbBreadcrumbComponent {}
