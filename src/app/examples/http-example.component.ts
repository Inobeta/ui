import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { IbHttpClientService } from 'src/app/inobeta-ui/http/http/http-client.service';
import { ibCrudToast } from '../inobeta-ui/http/http/messages.decorator';

@Component({
  selector: 'app-test',
  template: `

  <button (click)="decoratorTest()">Test decorator (success)</button>
  <button (click)="decoratorTest('some-error')">Test decorator (error)</button>
  <button (click)="otherTest()">Test 401</button>
  <button (click)="noSpinner()">No Spinner test</button>
  <button (click)="dataParams()">Test query params sanitize</button>
  <button (click)="dataWithResponseTypeBlob()">Test responseType 'blob'</button>

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

  dataParams() {
    const d = { params: { test1: 1, test2: 2 } };
    this.serviceCall('', d).subscribe(data => {
      console.log('final data', data);
    }, err => {
      console.log('error data', err);
    });
  }

  dataWithResponseTypeBlob() {
    return this.h.get('people/~jburkardt/data/csv/addresses.csv', {responseType: 'blob'}).subscribe(data => {
      console.log('final data', data);
    }, err => {
      console.log('error data', err);
    });
  }

  otherTest() {
    this.h.get('http://ec2-54-170-145-63.eu-west-1.compute.amazonaws.com/auth/admin/users?page=1&size=300').subscribe();
  }
  noSpinner() {
    this.h.get('http://repubblica.it').subscribe();
  }

}
