import { Component, OnChanges } from '@angular/core';
import { IbDynamicFormComponent } from '../../forms/dynamic-form/dynamic-form.component';
import { IbFormControlService } from '../../forms/form-control.service';

/**
 * Crea un form dinamico usando componenti di Angular Material.
 *
 * @example
 * <ib-material-form
 *             [fields]="loginFormFields"
 *             (ibSubmit)="onSubmit($event)"></ib-material-form>
 */
@Component({
  selector: 'ib-material-form',
  templateUrl: './material-form.component.html',
})
export class IbMaterialFormComponent extends IbDynamicFormComponent implements OnChanges {
  simpleActions = []
  submitAction = null

  constructor(private csIn: IbFormControlService){
    super(csIn);
  }
  ngOnChanges(changes){
    super.ngOnChanges(changes)
    if(changes.actions){
      this.simpleActions = changes.actions.currentValue.filter(a => a.key !== 'submit')
      this.submitAction = changes.actions.currentValue.find(a => a.key === 'submit')
    }
  }
}
