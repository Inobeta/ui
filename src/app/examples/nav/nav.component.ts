import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSideMenuComponent } from '../side-menu/app-side-menu.component';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
    imports: [RouterOutlet, AppSideMenuComponent]
})
export class NavComponent {}
