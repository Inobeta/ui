import {Directive, ElementRef} from '@angular/core';

@Directive({
  selector: '[tfInputText]'
})

export class TfInputTextDirective {
  constructor(private el: ElementRef) {
    el.nativeElement.style.background = 'none';
    el.nativeElement.style.border = 'none';
    el.nativeElement.style.borderBottom = '2px solid #fd4931';
    el.nativeElement.style.padding = '7px 25px';
    el.nativeElement.style.textAlign = 'center';
    el.nativeElement.style.display = 'inline-block';
    el.nativeElement.style.color = 'black';
    el.nativeElement.style.fontFamily = 'sans-serif';
  }
}
