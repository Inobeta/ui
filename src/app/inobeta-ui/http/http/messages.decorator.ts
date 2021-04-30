import { catchError, map } from 'rxjs/operators';
import { IbToastNotification } from '../../ui/toast/toast.service';
import { IbHttpModule } from '../http.module';

export function ibCrudToast(
  disableBackCall = false,
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
        map(() => {
          toast.open(successMessage);
          if (!disableBackCall) {
            setTimeout(() => {
              history.back();
            }, timeoutOnSave);
          }
        }),
        catchError(x => {
          toast.open(errorMessage, 'error');
          return x;
        }),
      );
    };

    return descriptor;
  };
}
