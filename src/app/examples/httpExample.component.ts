import { Component, OnInit } from '@angular/core';
import { IbHttpClientService } from 'src/app/inobeta-ui/http/http/http-client.service';

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
    private h: IbHttpClientService
  ) { }

  ngOnInit() {
    this.h.get('assets/i18n/it.json').subscribe(data => {
      this.loadedData = data
    })
  }
}
