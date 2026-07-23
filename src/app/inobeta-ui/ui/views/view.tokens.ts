import { InjectionToken } from "@angular/core";

/** Default prefix for Views localStorage keys. */
export const IB_VIEWS_DEFAULT_STORAGE_KEY = 'inobeta-ui-views';

/**
 * Configurable token for the Views localStorage key prefix.
 *
 * Each table group uses `<prefix>:<groupName>` as its storage key,
 * providing automatic isolation between different table instances.
 *
 * Override this token in your application module to use a custom
 * prefix if the default collides with other storage consumers.
 *
 * ```typescript
 * providers: [
 *   { provide: IB_VIEWS_STORAGE_KEY, useValue: 'my-app-views' }
 * ]
 * ```
 */
export const IB_VIEWS_STORAGE_KEY = new InjectionToken<string>(
  'IB_VIEWS_STORAGE_KEY',
  {
    providedIn: 'root',
    factory: () => IB_VIEWS_DEFAULT_STORAGE_KEY,
  }
);
