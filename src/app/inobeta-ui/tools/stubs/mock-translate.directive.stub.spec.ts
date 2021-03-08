import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'translate'
})
export class IbMockTranslatePipeDirective implements PipeTransform {
  public name = 'translate';
  public transform(query: string, ...args: any[]): any {
    return query;
  }
}
