import {Component, OnInit} from '@angular/core';
import 'hammerjs';

@Component({
  selector: 'ib-root',
  template: `
    <ib-table-example></ib-table-example>
  `
})
export class AppComponent implements OnInit {
  ngOnInit() {}
}
