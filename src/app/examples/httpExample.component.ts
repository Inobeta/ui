import { Component, OnInit } from '@angular/core';
import { HttpClientService } from 'src/app/inobeta-ui/modules/ibHttp/http/httpclient.service';

@Component({
  selector: 'app-test',
  template: `

  <pre>
    {{ loadedData | json }}
  </pre>

  `
})

export class HttpExampleComponent implements OnInit {
  loadedData: any = {}
  constructor(
    private h: HttpClientService
  ) { }

  ngOnInit() {
    this.h.get('assets/i18n/it.json').subscribe(data => {
      this.loadedData = data
    })
  }
}
