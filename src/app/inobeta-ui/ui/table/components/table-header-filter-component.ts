import { Subject } from '@angular-devkit/core/node_modules/rxjs';
import { Component, ComponentFactoryResolver, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { IbTableTitlesTypes } from '../models/titles.model';

@Component({
  selector: '[ib-table-header-filter]',
  template: `
  <div class="modal-selector" (click)="$event.stopPropagation();">
        <!--- filter type BOOLEAN -->
        <div class="modal-row"  *ngIf="col.type === columnTypes.BOOLEAN" >
        <div fxLayout="row" [formGroup]="generalForm">
        <mat-form-field style="width:220px;">
          <mat-label>{{'shared.ibTable.filter' | translate}}</mat-label>
          <mat-select
            formControlName="filter"
            (selectionChange)="search(generalForm.controls.filter.value)"
          >
            <mat-option
              (click)="$event.stopPropagation()"
              [value]=""
            ></mat-option>
            <mat-option
              (click)="$event.stopPropagation()"
              [value]="true"
            >{{'shared.ibTable.true' | translate}}</mat-option>
            <mat-option
              (click)="$event.stopPropagation()"
              [value]="false"
            >{{'shared.ibTable.false' | translate}}</mat-option>
          </mat-select>
          </mat-form-field>
        </div>
      </div>


    <!--- filter type STRING -->
      <div class="modal-row"  *ngIf="col.type === columnTypes.STRING || col.type === columnTypes.ANY" >
        <div fxLayout="row">
        <mat-form-field style="width:220px;">
        <mat-label>{{'shared.ibTable.filter' | translate}}</mat-label>
          <input
            #searchInput
            autocomplete="off"
            matInput
            [value]="filter || ''"
            (keyup)="search(searchInput.value)"
            />
          <i
          matSuffix
          class="material-icons modal-icons"
          (click)="searchInput.value = ''; search(searchInput.value)"
          >close</i>
          <!--<i
          class="material-icons modal-icons"
          (click)="search(searchInput.value)"
          >search</i>-->
          </mat-form-field>
        </div>
      </div>


      <!--- filter type DATE or NUMBER or INPUT_NUMBER -->
      <div
        class="modal-row"
        *ngIf="[columnTypes.NUMBER, columnTypes.INPUT_NUMBER, columnTypes.DATE].indexOf(col.type) > -1 "
      >
      <div fxLayout="column">
        <div
          fxLayout="row"
          fxLayoutGap="5px"
          *ngFor="let cond of numericConditions; let last = last"
          [formGroup]="cond"
          >
          <mat-form-field style="width:70px;">
            <mat-label>Condizione</mat-label>
            <mat-select formControlName="condition">
              <mat-option
                *ngFor="let op of compareClauses"
                (click)="$event.stopPropagation()"
                [value]="op.value"
              >{{op.label}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field style="width:130px;">
            <mat-label>Valore</mat-label>
            <input
              formControlName="value"
              autocomplete="off"
              matInput
              [type]="col.type === columnTypes.DATE ? 'date' : 'number'"
              />
          </mat-form-field>
          <i
          *ngIf="!last || (last && numericConditions.length > 1)"
          class="material-icons modal-icons"
          style="line-height:50px;"
          (click)="removeClause(cond)"
          >delete</i>
          <i
          *ngIf="last && numericConditions.length < 2"
          class="material-icons modal-icons"
          style="line-height:50px;"
          (click)="addClause()"
          >add</i>
        </div>
        <ib-table-button
          label="shared.ibTable.apply"
          color="primary"
          style="float:right"
          [disabled]="!numericFormsValid()"
          (click)="searchNumeric()"
        ></ib-table-button>
        </div>

      </div>
    </div>
  `,
  styles: [
    `
      .modal-selector {
        width: 260px;
        min-height: 200px;
        max-height: 300px;
        overflow-y: auto;
        background-color: white;
        -webkit-box-shadow: 40px 20px 70px 0 rgba(0, 0, 0, 0.49);
        -moz-box-shadow: 40px 20px 70px 0 rgba(0, 0, 0, 0.49);
        box-shadow: 40px 20px 70px 0 rgba(0, 0, 0, 0.49);
        color: black;
        z-index: 100;
      }

      .modal-row {
        font-family: 'Red Hat Text';
        font-weight: bold;
        size: 18px;
        color: #999999;
        padding: 10px;
        padding-right: 20px;
        padding-left: 20px;
      }

      .mat-input-element {
        font-family: 'Red Hat Text' !important;
      }

      .modal-row:hover, .modal-row-active {
        background-color: #F7F7F7;
      }

      .modal-icons {
        float: right;
        size: 10px;
        font-weight: normal;
      }

      .inner-modal {
        margin-left: 200px;
        margin-top: 125px;
        width: 300px;
      }

      .inner-modal .modal-row {
        overflow-x: hidden;
        text-overflow: ellipsis;
      }

    `

  ]

})

export class IbTableHeaderFilterComponent implements OnInit{
  @Input() ibTable: any;
  @Input() col: any;
  @Input() filter: any;


  columnTypes = IbTableTitlesTypes

  searchSubject = new Subject();
  filterDistinct: any[] = [];
  generalForm;

  compareClauses = [
    { value: '<', label: '<'},
    { value: '<=', label: '<='},
    { value: '==', label: '='},
    { value: '>', label: '>'},
    { value: '>=', label: '>='}
  ]

  numericConditions = []

  constructor(private fb: FormBuilder) {
    this.searchSubject.pipe(
      debounceTime(700)
    ).subscribe((value) => this.doFilter(value));
  }
  ngOnInit(): void {
    this.initForm(this.col, this.filter)
  }

  doFilter(value) {
    this.ibTable.setFilter(this.col.key, value);
  }

  search(what) {
    this.searchSubject.next(what);
  }

  removeClause(cond){
    const index = this.numericConditions.indexOf(cond)
    this.numericConditions.splice(index, 1)
  }

  addClause(filter = {
    condition: '',
    value: ''
  }){
    this.numericConditions.push(
      this.fb.group({
        condition: new FormControl(filter.condition, Validators.required),
        value: new FormControl(filter.value, Validators.required)
      })
    )
  }

  searchNumeric(){
    this.search(this.numericConditions.map(c => c.value))
  }

  numericFormsValid(){
    return this.numericConditions.reduce((acc, el) => {
      if(!el.valid) return false
      return acc
    }, true)
  }

  initForm(col, filter){

    if([
      this.columnTypes.NUMBER,
      this.columnTypes.INPUT_NUMBER,
      this.columnTypes.DATE
    ].indexOf(col.type) > -1){
      if(this.filter && filter.length > 0){
        filter.forEach(f => this.addClause(f))
      }
      else{
        this.addClause();
      }
    }
    else{
      this.generalForm =  this.fb.group({
        filter: new FormControl( this.filter )
      })
    }
  }
}
