import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { IbFormArray } from "../array/array";
import { IbFormControlBase } from "../controls/form-control-base";
import { IbFormControlService } from "../form-control.service";
import { IbFormField } from "../forms.types";

export interface IbFormAction {
  key?: string;
  label: string;
  handler?: (form: UntypedFormGroup) => void;
  options?: any;
  requireConfirmOnDirty?: boolean;
}

interface IbFormOnChanges {
  changes: SimpleChanges;
  form: UntypedFormGroup;
}

@Component({
  selector: "ib-form",
  templateUrl: "./dynamic-form.component.html",
})
export class IbDynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fields: IbFormField[] = [];
  @Input() actions: IbFormAction[] = [{ key: "submit", label: "Save" }];
  @Input() cols: number;
  /**
   * @deprecated
   * this input will be removed in a future release.
   * Utilizzare una subscription ad `afterInit()` per eseguire codice immediatamente dopo aver
   * inizializzato il `FormGroup` (come `form.disable()`)
   */
  @Input() disabledOnInit = false;
  @Output() ibSubmit = new EventEmitter<any>();
  form: UntypedFormGroup;

  private readonly onInitSubject = new Subject<UntypedFormGroup>();

  private readonly onChangesSubject = new Subject<IbFormOnChanges>();

  constructor(private cs: IbFormControlService) {}

  ngOnInit() {
    this.form = this.cs.toFormGroup(this.fields);
    this.onInitSubject.next(this.form);
    if (this.disabledOnInit) {
      this.form.disable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields = changes.fields;

    if (fields && !fields.isFirstChange()) {
      this.form = this.cs.toFormGroup(fields.currentValue);
    }

    const cols = changes.cols;
    if (fields && cols) {
      const hasFormArray = (fields.currentValue as IbFormField[]).find(
        (f) => f.role === "array"
      );
      if (hasFormArray && cols.currentValue > 0) {
        console.warn(
          `IbFormArray is not supported in grid mode and will not be shown. Please, remove the cols input from ib-material-form`
        );
      }
    }

    for (const prop of Object.values(changes)) {
      if (!prop.isFirstChange()) {
        this.onChangesSubject.next({ changes, form: this.form });
        break;
      }
    }
  }

  ngOnDestroy() {
    this.onInitSubject.unsubscribe();
    this.onChangesSubject.unsubscribe();
  }

  onSubmit() {
    this.ibSubmit.emit(this.form.getRawValue());
  }

  handleActionClick(source: IbFormAction) {
    if (source.key === "submit") {
      return;
    }
    source.handler(this.form);
  }

  afterInit(): Observable<UntypedFormGroup> {
    return this.onInitSubject;
  }

  afterChanges(): Observable<IbFormOnChanges> {
    return this.onChangesSubject;
  }
}
