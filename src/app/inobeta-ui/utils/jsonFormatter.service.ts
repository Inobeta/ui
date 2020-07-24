import {Injectable} from '@angular/core';

@Injectable()

export class JsonFormatterService {

  formatArrayToJson(array): any {
    const obj: any = {};
    for (let i = 0; i < array.length; i++) {
      if (array[i].value !== null && array[i].value !== '') {
        obj[array[i].value] = array[i].label;
      }
    }
    return obj;
  }
}
