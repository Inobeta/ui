import { AbstractControl, ValidatorFn } from "@angular/forms";

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.parent) {
      return;
    }
    const dateFrom = control.parent.controls["dateFrom"];
    const dateTo = control.parent.controls["dateTo"];
    if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
      return {
        customError: {
          message: '"Date from" non può essere maggiore di "Date to"',
        },
      };
    }
  };
}

export function multipleCustomExample(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (
      control.value &&
      control.value.getTime() < new Date("2021-04-15").getTime()
    ) {
      return {
        customError: {
          message: "Impostare un valore successivo al 15/04/2021",
        },
      };
    }
  };
}

export function forceValueValidator(
  forcedValue: string,
  errorMessage: string
): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (control.value !== forcedValue) {
      return {
        customError: {
          message: errorMessage,
          params: {
            forcedValue,
          },
        },
      };
    }
  };
}
