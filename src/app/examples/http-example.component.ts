import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { IbHttpClientService } from 'src/app/inobeta-ui/http/http/http-client.service';
import { ibCrudToast } from '../inobeta-ui/http/http/messages.decorator';

@Component({
  selector: 'app-test',
  template: `

  <button (click)="decoratorTest()">Test decorator (success)</button>
  <button (click)="decoratorTest('some-error')">Test decorator (error)</button>

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

  @ibCrudToast(true)
  serviceCall(wrong = '') {
    return this.h.get(`assets/i18n/it.json${wrong}`).pipe(
      map((x) => {
        console.log('additional map', x);
        return x;
      })
    );
  }

  decoratorTest(wrong = '') {
    this.serviceCall(wrong).subscribe();
  }

}
