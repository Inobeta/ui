import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IbBreadcrumbModule } from 'public_api';
import { IbMainMenuExampleComponent } from '../main-menu-example/main-menu-example.component';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
    imports: [
      RouterOutlet, IbBreadcrumbModule, IbMainMenuExampleComponent
    ]
})
export class NavComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
