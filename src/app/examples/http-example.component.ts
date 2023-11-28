import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { ibCrudToast } from '../inobeta-ui/http/http/messages.decorator';
import { ibLoaderActions } from '../inobeta-ui/http/store/loader/actions';

@Component({
  selector: 'app-test',
  template: `
<mat-grid-list [cols]="4"  class="ib-material-form-grid" rowHeight="60px">
  <mat-grid-tile [colspan]="1" [rowspan]="1">
    <button mat-raised-button color="primary" (click)="decoratorTest()">Test decorator (success)</button>
  </mat-grid-tile>
  <mat-grid-tile [colspan]="1" [rowspan]="1">
    <button mat-raised-button color="primary" (click)="decoratorTest('some-error')">Test decorator (error)</button>
  </mat-grid-tile>
  <mat-grid-tile [colspan]="1" [rowspan]="1">
    <button mat-raised-button color="primary" (click)="otherTest()">Test 401</button>
  </mat-grid-tile>
  <mat-grid-tile [colspan]="1" [rowspan]="1">
    <button mat-raised-button color="primary" (click)="noSpinner()">No Spinner test</button>
  </mat-grid-tile>
</mat-grid-list>
<div class="display-container">
  <pre *ibLoading="{size: 12, width: '25%', endpoint: {url: 'assets/i18n/it.json', method: 'GET'}}">
    {{ loadedData | json }}
  </pre>
  <pre *ibLoading="{size: 8, width: '25%'}">
    test loader result end
  </pre>
</div>
  `,
  styles:[`
  .display-container{
    display: flex;
  }
  .display-container pre{
    flex: 1;
  }
  `]
})

export class HttpExampleComponent implements OnInit {
  loadedData: any = {};
  constructor(
    private h: HttpClient,
    private store: Store
  ) { }

  ngOnInit() {
    this.h.get('assets/i18n/it.json').subscribe(data => {
      this.loadedData = data;
    });
  }

  @ibCrudToast()
  serviceCall(wrong = '') {
    return this.h.get(`assets/i18n/it.json${wrong}`).pipe(
      map((x) => {
        console.log('additional map', x);
        return x;
      })
    );
  }

  decoratorTest(wrong = '') {
    this.serviceCall(wrong).subscribe(data => {
      console.log('final data', data);
    }, err => {
      console.log('error data', err);
    });
  }


  otherTest() {
    this.h.get('http://ec2-54-170-145-63.eu-west-1.compute.amazonaws.com/auth/admin/users?page=1&size=300').subscribe();
  }
  noSpinner() {
    this.store.dispatch(ibLoaderActions.skipShow())
    this.h.get('assets/i18n/it.json').subscribe();
  }

}
