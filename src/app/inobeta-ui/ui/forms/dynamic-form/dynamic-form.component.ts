import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { IbFormControlBase } from '../controls/form-control-base';
import { FormGroup } from '@angular/forms';
import { IbFormControlService } from '../form-control.service';
import { Observable, Subject } from 'rxjs';

export interface IbFormAction {
  key?: string;
  label: string;
  handler?: (form: FormGroup) => void;
  options?: any;
  requireConfirmOnDirty?: boolean;
}

interface IbFormOnChanges {
  changes: SimpleChanges;
  form: FormGroup;
}

@Component({
  selector: 'ib-form',
  templateUrl: './dynamic-form.component.html',
})
export class IbDynamicFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() fields: IbFormControlBase<string>[] = [];
  @Input() actions: IbFormAction[] = [
    { key: 'submit', label: 'Save' }
  ];
  @Input() cols: number;
  /**
   * @deprecated
   * this input will be removed in a future release.
   * Utilizzare una subscription ad `afterInit()` per eseguire codice immediatamente dopo aver
   * inizializzato il `FormGroup` (come `form.disable()`)
   */
  @Input() disabledOnInit = false;
  @Output() ibSubmit = new EventEmitter<any>();
  form: FormGroup;

  private readonly onInitSubject = new Subject<FormGroup>();

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
    for (const prop of Object.values(changes)) {
      if (!prop.isFirstChange()) {
        this.onChangesSubject.next({changes, form: this.form});
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
    if (source.key === 'submit') {
      return;
    }
    source.handler(this.form);
  }

  afterInit(): Observable<FormGroup> {
    return this.onInitSubject;
  }

  afterChanges(): Observable<IbFormOnChanges> {
    return this.onChangesSubject;
  }
}
