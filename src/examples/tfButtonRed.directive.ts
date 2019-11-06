import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[tfButtonRed]'
})

export class TfButtonRedDirective {
  constructor(private el: ElementRef) {
    el.nativeElement.style.backgroundColor = '#fd4931';
    el.nativeElement.style.border = 'none';
    el.nativeElement.style.padding = '7px 25px';
    el.nativeElement.style.textAlign = 'center';
    el.nativeElement.style.display = 'inline-block';
    el.nativeElement.style.color = 'white';
    el.nativeElement.style.fontFamily = 'sans-serif';
  }
}
