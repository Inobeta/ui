import { Component } from '@angular/core';
import { DynamicFormComponent } from 'src/app/inobeta-ui/forms/dynamic-form/dynamic-form.component';

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
export class MaterialFormComponent extends DynamicFormComponent {}
