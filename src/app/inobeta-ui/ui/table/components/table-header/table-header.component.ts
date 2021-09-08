import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { IbStickyAreas, ibTableSupportedFilters, IbTableTitles, IbTableTitlesTypes } from '../../models/titles.model';
import { IbTemplateModel } from '../../models/template.model';
import { Store } from '@ngrx/store';
import { IbModalMessageService } from '../../../modal/modal-message.service';
import { IbTableConfSaveComponent } from '../table-conf/table-conf-save.component';
import { ibTableActionLoadConfig, ibTableActionSaveConfig } from '../../store/actions/table.actions';
import { IbModalMessage } from '../../../modal/modal-message.model';
import { IbTableConfLoadComponent } from '../table-conf/table-conf-load.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[ib-table-header]',
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.css']
})
export class IbTableHeaderComponent implements OnInit {
  @Input() table: any;
  @Input() titles: IbTableTitles[] = [];
  @Input() selectableRows = true;
  @Input() currentSort: any = {};
  @Input() templateHeaders: any = {};
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() columnFilter = {};
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() stickyAreas = [];
  @Input() tableName: string;

  renderContextMenu = {};
  visibleHeaders = {};
  columnTypes = IbTableTitlesTypes;
  supportedFilters = ibTableSupportedFilters;
  ibStickyArea = IbStickyAreas;

  @Output() handleSetFilter = new EventEmitter<any>();

  constructor(
    private store: Store<any>,
    private ibModal: IbModalMessageService
  ) { }

  ngOnInit() {
  }

  resetCustomHeaderVisibility(event = null) {
    if (event) {
      event.stopPropagation();
    }
    this.visibleHeaders = {};
  }

  setFilter(key, value, indexToSet = 0) {
    this.handleSetFilter.emit({
      key,
      value,
      indexToSet
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    // tslint:disable-next-line: forin
    for (const el in this.visibleHeaders) {
      event.stopPropagation();
      break;
    }
    this.resetCustomHeaderVisibility();
  }

  hasCustomHeadersVisible() {
    return Object.keys(this.visibleHeaders).length > 0;
  }

  saveConf() {

    console.log('saveConf');
    this.ibModal.show({
      title: 'shared.ibTable.saveConf.title',
      message: 'shared.ibTable.saveConf.message',
      tableName: this.tableName
    } as IbTableConfDialogParams, IbTableConfSaveComponent).subscribe(data => {
      if (data) {
        this.store.dispatch(ibTableActionSaveConfig({ options: data, tableName: this.tableName }));
      }
    });
  }
  loadConf() {
    this.ibModal.show({
      title: 'shared.ibTable.loadConf.title',
      message: 'shared.ibTable.loadConf.message',
      tableName: this.tableName
    } as IbTableConfDialogParams, IbTableConfLoadComponent).subscribe(data => {
      if (data) {
        this.store.dispatch(ibTableActionLoadConfig({ configName: data.name, tableName: this.tableName }));
      }
    })
  }
}

export interface IbTableConfDialogParams extends IbModalMessage {
  tableName: string;
}
