import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { IbModalMessageService } from '../../modal/modal-message.service';
import { IbTableItem } from '../models/table-item.model';
import { IbTemplateModel } from '../models/template.model';
import { IbStickyAreas, IbTableCellAligns, IbTableTitles, IbTableTitlesTypes } from '../models/titles.model';

@Component({
  selector: '[ib-table-row]',
  template: `
  <!--CHECKBOX-->
  <td *ngIf="selectableRows" [ibStickyColumn]="{ sticky: stickyAreas.includes(ibStickyArea.SELECT), key: 'ib-select'}" [formGroup]="formRow" style="text-align:center;">
    <mat-checkbox
      formControlName="isChecked"
      (click)="$event.stopPropagation();"
      (change)="rowChecked.emit(objectToEmit())"
    ></mat-checkbox>
  </td>

  <td
    *ngFor="let t of titles"
    style="padding: 10px 15px;"
    [ngStyle]="{
       'text-align': (t.align) ? t.align : alignEnum.LEFT
    }"
    class="{{ 'ib-table-column-type-' + t.type }}"
    [ibStickyColumn]="t"
    [ngClass]="(t.getClassByCondition) ? t.getClassByCondition(item) : null">

    <!--TYPE = ANY-->
    <span *ngIf="!t.type || t.type === typeEnum.ANY" class="{{t.className}}}">
      {{item[t.key] | translate}}
    </span>

    <!--TYPE = NUMBER-->
    <span *ngIf="t.type === typeEnum.NUMBER" class="{{t.className}}">
        {{item[t.key] | number:t.format:'it'}}
    </span>

    <!--TYPE = DATE-->
    <span *ngIf="t.type === typeEnum.DATE" class="{{t.className}}">
      {{item[t.key] | date: 'dd/MM/yyyy'}}
    </span>

    <!--TYPE = HOUR-->
    <span *ngIf="t.type === typeEnum.HOUR" class="{{t.className}}">
      {{item[t.key] | date: 'HH:mm:ss'}}
    </span>

    <!--TYPE = STRING-->
    <span *ngIf="t.type === typeEnum.STRING" class="{{t.className}}">
      {{item[t.key]}}
    </span>


    <!--TYPE = TAG-->
    <span *ngIf="t.type === typeEnum.TAG" class="{{t.className}}">
       <mat-chip-list>
         <mat-chip
           *ngFor="let tag of item[t.key]"
           [ngStyle]="{
             'background-color': tag.background || '#f2536e',
             'color': tag.color
           }"
           style="
              text-transform: uppercase;">
           {{ tag.name | translate }}
         </mat-chip>
       </mat-chip-list>
     </span>

    <!--TYPE = COMBOBOX-->
    <span *ngIf="t.type === typeEnum.COMBOBOX" class="{{t.className}}">
      {{ t.comboOptions[item[t.key]] | translate }}
    </span>

    <!--TYPE = BOOLEAN-->
    <span *ngIf="t.type === typeEnum.BOOLEAN" class="{{t.className}}">
      <i
        class="material-icons"
        style="color:green;"
        *ngIf="item[t.key] === true">check
      </i>
      <i
        class="material-icons"
        style="color:gray;"
        *ngIf="item[t.key] === false">clear
      </i>
     </span>

    <!--TYPE = INPUT-->
    <span *ngIf="t.type === typeEnum.INPUT_NUMBER" class="{{t.className}}">
      <mat-form-field>
        <input
          [(ngModel)]="item[t.key]"
          matInput
          type="number"
          (change)="t.change ? t.change(item, $event['value']) : null"
          placeholder="{{ t.placeHolderInput | translate }}"
          value="{{item[t.key]}}">
        </mat-form-field>
    </span>

    <!--TYPE = CUSTOM-->
    <span *ngIf="t.type === typeEnum.CUSTOM" class="{{t.className}}">
      <ng-container
        *ngTemplateOutlet="customItemTemplate[t.key]; context: objectToEmit()">
    </ng-container>
    </span>
  </td>
  <td [ibStickyColumn]="{ sticky: stickyAreas.includes(ibStickyArea.TEMPLATE) && 'end', key: 'ib-template-'+btn.columnName}"
     style="text-align: center" *ngFor="let btn of templateButtons">
    <ng-container
      *ngTemplateOutlet="btn.template; context: objectToEmit()">
    </ng-container>
  </td>
  <td
    [ibStickyColumn]="{ sticky: stickyAreas.includes(ibStickyArea.EDIT) && 'end', key: 'ib-edit' }"
    style="text-align:center;" *ngIf="hasEdit">
    <i
      class="material-icons ib-table-row-button"
      matRipple
      (click)="$event.stopPropagation(); edit.emit(objectToEmit())"
    >{{ iconSet.edit }}</i>
  </td>
  <td
    [ibStickyColumn]="{ sticky: stickyAreas.includes(ibStickyArea.DELETE) && 'end', key: 'ib-delete' }"
    style="text-align:center;" *ngIf="hasDelete">
    <i
      class="material-icons ib-table-row-button"
      matRipple
      (click)="$event.stopPropagation(); handleDelete()"
    >{{ iconSet.delete }}</i>
  </td>
  <td
    [ibStickyColumn]="{ sticky: stickyAreas.includes(ibStickyArea.SETTINGS) && 'end', key: 'ib-settings' }"
  ></td>

  `
})

export class IbTableRowComponent implements OnInit {
  @Input() item: IbTableItem;
  @Input() titles: IbTableTitles[] = [];
  @Input() customItemTemplate: any;
  @Input() selectableRows = true;
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() formRow: UntypedFormGroup;
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() deleteConfirm = true;
  @Input() iconSet = {
    edit: 'edit',
    delete: 'delete'
  };
  @Input() stickyAreas = [];

  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();

  typeEnum = IbTableTitlesTypes;
  alignEnum = IbTableCellAligns;
  ibStickyArea = IbStickyAreas;


  objectToEmit() {
    return { item: this.item, isChecked: (this.formRow.controls.isChecked.value || false), form: this.formRow };
  }
  constructor(private ibModal: IbModalMessageService) { }

  ngOnInit() {
  }

  handleDelete() {
    if (this.deleteConfirm) {
      return this.ibModal.show({
        title: 'shared.ibTable.confirmDeleteTitle',
        message: 'shared.ibTable.confirmDeleteMessage'
      }).subscribe(r => {
        if (r) {
          this.delete.emit(this.objectToEmit())
        }
      })
    }

    this.delete.emit(this.objectToEmit())
  }
}
