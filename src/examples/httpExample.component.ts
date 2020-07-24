import { Component, OnInit } from '@angular/core';
import { HttpClientService } from 'src/app/inobeta-ui/http/httpclient.service';

@Component({
  selector: 'app-test',
  template: `

  test

  `
})

export class HttpExampleComponent implements OnInit {
  constructor(
    private h: HttpClientService
  ) { }

  ngOnInit() {
    this.h.get('http://google.it').subscribe(data => {
      console.log(data)
    })
  }
}
