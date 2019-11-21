import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'mockTranslate'
})
export class MockTranslatePipeDirective implements PipeTransform {
  public name = 'mockTranslate';
  public transform(query: string, ...args: any[]): any {
    return query;
  }
}
