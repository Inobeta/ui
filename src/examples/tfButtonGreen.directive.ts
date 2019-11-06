import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[tfButtonGreen]'
})

export class TfButtonGreenDirective {
  constructor(private el: ElementRef) {
    el.nativeElement.style.backgroundColor = '#8bc53f';
    el.nativeElement.style.border = 'none';
    el.nativeElement.style.padding = '7px 25px';
    el.nativeElement.style.textAlign = 'center';
    el.nativeElement.style.display = 'inline-block';
    el.nativeElement.style.color = 'white';
    el.nativeElement.style.fontFamily = 'sans-serif';
  }
}
