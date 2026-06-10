import { InjectionToken } from '@angular/core';

/** Injection token for the views storage key used when persisting views */
export const IB_VIEWS_STORAGE_KEY = new InjectionToken<string>('IB_VIEWS_STORAGE_KEY', {
  providedIn: 'root',
  factory: () => '__ib-views__',
});
