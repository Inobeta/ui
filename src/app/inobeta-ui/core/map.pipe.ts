import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'map'
})
export class MapPipe implements PipeTransform {
  transform(array: Record<string, unknown>[], key: string): string[] {
    if (!Array.isArray(array) || typeof key !== 'string') {
      return [];
    }
    return array.map(item => String(item[key]));
  }
}
