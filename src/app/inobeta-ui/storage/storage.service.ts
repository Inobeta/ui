import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class IbStorageService {
  constructor() { }

  set(key: string, object: any, storageType: IbStorageTypes = IbStorageTypes.LOCALSTORAGE){
    switch (storageType){
      case IbStorageTypes.LOCALSTORAGE:
        localStorage.setItem(key, JSON.stringify(object));
        break;
      case IbStorageTypes.COOKIESTORAGE:
        this.setCookie(key, JSON.stringify(object));
        break;
    }
  }

  get(key: string, storageType: IbStorageTypes = IbStorageTypes.LOCALSTORAGE): any{
    let data: string;
    switch (storageType){
      case IbStorageTypes.LOCALSTORAGE:
        data = localStorage.getItem(key);
        break;
      case IbStorageTypes.COOKIESTORAGE:
        data = this.getCookie(key);
        break;
    }
    if (data){
      return JSON.parse(data);
    }
  }

  private setCookie(name: string, val: string) {
    const date = new Date();
    const value = val;
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + '; expires=' + date.toUTCString() + '; path=/';
  }

  private getCookie(name: string) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
  }

}

export enum IbStorageTypes{
  LOCALSTORAGE, COOKIESTORAGE
}
