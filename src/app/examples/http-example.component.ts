import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { IbHttpClientService } from 'src/app/inobeta-ui/http/http/http-client.service';
import { ibCrudToast } from '../inobeta-ui/http/http/messages.decorator';

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
  <mat-grid-tile [colspan]="1" [rowspan]="1">
    <button mat-raised-button color="primary" (click)="getBlobData()">Test responseType 'blob'</button>
  </mat-grid-tile>
</mat-grid-list>

  <pre>
    {{ loadedData | json }}
  </pre>

  `
})

export class HttpExampleComponent implements OnInit {
  loadedData: any = {};
  constructor(
    private h: IbHttpClientService
  ) { }

  ngOnInit() {
    this.h.get('assets/i18n/it.json').subscribe(data => {
      this.loadedData = data;
    });
  }

  @ibCrudToast()
  serviceCall(wrong = '', data = null) {
    return this.h.get(`assets/i18n/it.json${wrong}`, data).pipe(
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

  getBlobData() {
    return this.h.get('assets/i18n/it.json', {provaTest: 'bah'}, { responseType: 'blob'}).subscribe(data => {
      console.log('blob data', data);
    });
  }

  otherTest() {
    this.h.get('http://ec2-54-170-145-63.eu-west-1.compute.amazonaws.com/auth/admin/users?page=1&size=300').subscribe();
  }
  noSpinner() {
    this.h.get('http://repubblica.it').subscribe();
  }

}
