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

/** @deprecated */
@Component({
  selector: "ib-form",
  templateUrl: "./dynamic-form.component.html",
})
export class IbDynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fields: IbFormField[] = [];
  @Input() value: Record<string, unknown> = {};
  @Input() actions: IbFormAction[] = [{ key: "submit", label: "Save" }];
  @Input() cols: number;
  @Input() disabled: boolean | undefined = undefined;
  @Output() ibSubmit = new EventEmitter<any>();
  form: UntypedFormGroup;

  /** @ignore */
  private readonly onInitSubject = new Subject<UntypedFormGroup>();

  /** @ignore */
  private readonly onChangesSubject = new Subject<IbFormOnChanges>();

  constructor(private cs: IbFormControlService) {}

  ngOnInit() {
    this.form = this.cs.toFormGroup(this.fields);
    if (this.disabled === true) {
      this.fieldsHasDisabled()
      this.form?.disable();
    } else if (this.disabled === false) {
      this.fieldsHasDisabled()
      this.form?.enable();
    }
    this.form.patchValue(this.value);
    this.onInitSubject.next(this.form);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields = changes.fields;

    if (fields && !fields.isFirstChange()) {
      this.form = this.cs.toFormGroup(fields.currentValue);
      this.form.patchValue(this.value);
    }

    const value = changes.value;
    if (value && !value.isFirstChange()) {
      this.form.patchValue(value.currentValue);
    }

    if (this.disabled === true) {
      this.fieldsHasDisabled()
      this.form?.disable();
    } else if (this.disabled === false) {
      this.fieldsHasDisabled()
      this.form?.enable();
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
    this.onInitSubject?.complete();
    this.onChangesSubject?.complete();
  }

  handleSubmit() {
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

  fieldsHasDisabled() {
    if(this.fields.some((f) => f['disabled'])){
      console.warn(`[@inobeta/ui -> IbMaterialForms] The fields "${this.fields.filter((f) => f['disabled']).map((f) => f['key']).join(', ')}" use the deprecated property 'disabled', which will be ignored.
The 'disabled' property of the <ib-material-form> takes priority.
      `);
    }
  }
}
