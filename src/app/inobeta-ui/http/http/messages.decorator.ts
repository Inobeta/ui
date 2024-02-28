import { catchError, map } from 'rxjs/operators';
import { IbToastNotification } from '../../ui/toast/toast.service';
import { IbHttpModule } from '../http.module';

/**
 * Method decorator for displaying toast notifications and optionally navigating back after a CRUD operation.
 *
 * @param enableBackCall Indicates whether to navigate back after the operation.
 * @param successMessage The success message to be displayed in the toast notification. (i18n)
 * @param timeoutOnSave Time in milliseconds to wait before navigating back (if enabled).
 * @returns MethodDecorator
 *
 * Usage example:
 * ```typescript
 * @ibCrudToast(true, 'Record saved successfully', 500)
 * handleSave() {
 *   // ... your save logic ...
 *   return someObservable;
 * }
 * ```
 */
export function ibCrudToast(
  enableBackCall = false,
  successMessage = 'shared.ibCrudToast.success',
  timeoutOnSave = 500,
  ): MethodDecorator {
  return function(target, key: string, descriptor: any) {

    const originalMethod = descriptor.value;

    descriptor.value =  function(...args: any[]) {

      const result = originalMethod.apply(this, args);
      const toast = IbHttpModule.injector.get<IbToastNotification>(IbToastNotification);
      return result.pipe(
        map((x) => {
          if (successMessage) { toast.open(successMessage); }
          if (enableBackCall) {
            setTimeout(() => {
              history.back();
            }, timeoutOnSave);
          }
          return x;
        }),
      );
    };

    return descriptor;
  };
}
