import { catchError, map } from 'rxjs/operators';
import { IbToastNotification } from '../../ui/toast/toast.service';
import { IbHttpModule } from '../http.module';

export function ibCrudToast(
  enableBackCall = false,
  successMessage = 'shared.ibCrudToast.success',
  errorMessage = 'shared.ibCrudToast.error',
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
        catchError(x => {
          if (errorMessage) {toast.open(errorMessage, 'error'); }
          throw x;
        }),
      );
    };

    return descriptor;
  };
}
