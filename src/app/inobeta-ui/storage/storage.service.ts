import { Injectable } from "@angular/core";

/**
 * Handles storage operations such as setting and getting data
 * in either localStorage or cookies.
 *
 * Usage:
 * - Inject the `IbStorageService` service in your component or service.
 * - Use the `set` method to store data and the `get` method to retrieve data.
 *
 * Example:
 * ```typescript
 * constructor(private storageService: IbStorageService) {}
 *
 * saveData() {
 *   const data = { key: 'value' };
 *   this.storageService.set('myKey', data);
 * }
 *
 * retrieveData() {
 *   const savedData = this.storageService.get('myKey');
 *   console.log(savedData);
 * }
 * ```
 */
@Injectable({ providedIn: "root" })
export class IbStorageService {
  /**
   * Method to set data in storage (localStorage or cookies).
   *
   * @param key The key under which to store the data
   * @param object The data object to be stored
   * @param storageType The type of storage to use (IbStorageTypes.LOCALSTORAGE or IbStorageTypes.COOKIESTORAGE)
   */
  set(
    key: string,
    object: any,
    storageType: IbStorageTypes = IbStorageTypes.LOCALSTORAGE
  ): void {
    switch (storageType) {
      case IbStorageTypes.LOCALSTORAGE:
        localStorage.setItem(key, JSON.stringify(object));
        break;
      case IbStorageTypes.COOKIESTORAGE:
        this.setCookie(key, JSON.stringify(object));
        break;
    }
  }

  /**
   * Method to get data from storage (localStorage or cookies).
   *
   * @param key The key under which the data is stored
   * @param storageType The type of storage to use (IbStorageTypes.LOCALSTORAGE or IbStorageTypes.COOKIESTORAGE)
   * @returns The retrieved data object or null if not found
   */
  get(
    key: string,
    storageType: IbStorageTypes = IbStorageTypes.LOCALSTORAGE
  ): any {
    let data: string;
    switch (storageType) {
      case IbStorageTypes.LOCALSTORAGE:
        data = localStorage.getItem(key);
        break;
      case IbStorageTypes.COOKIESTORAGE:
        data = this.getCookie(key);
        break;
    }
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  /**
   * Set a cookie with the provided name and value.
   *
   * @param name The name of the cookie
   * @param val The value to be stored in the cookie
   */
  private setCookie(name: string, val: string): void {
    const date = new Date();
    const value = val;
    date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000); // Cookie expiration time: 7 days
    document.cookie =
      name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
  }

  /**
   * Get the value of a cookie with the provided name.
   *
   * @param name The name of the cookie
   * @returns The value of the cookie or undefined if not found
   */
  private getCookie(name: string): string | undefined {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return undefined;
  }
}

export enum IbStorageTypes {
  LOCALSTORAGE,
  COOKIESTORAGE,
}
