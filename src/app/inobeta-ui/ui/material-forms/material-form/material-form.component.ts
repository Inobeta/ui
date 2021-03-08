import { Component, OnChanges } from '@angular/core';
import { IbDynamicFormComponent } from '../../forms/dynamic-form/dynamic-form.component';

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
export class IbMaterialFormComponent extends IbDynamicFormComponent implements OnChanges {}
