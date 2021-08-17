import { Injectable } from '@angular/core';
import { IbAuthService } from '../../../http/auth/auth.service';
import { IbStorageService } from '../../../storage/storage.service';
import { IbTableConfigState } from '../store/reducers/table.reducer';


export const IB_TABLE_STORAGE_NAME = 'ib-table-store';
export const IB_TABLE_ANON_USER = 'ib-anon';


@Injectable({providedIn: 'root'})
export class IbTableConfService {

  constructor(
    private storage: IbStorageService,
    private auth: IbAuthService
  ) { }

  saveConfig(tableName, configName, config){
    let user = IB_TABLE_ANON_USER;
    if (this.auth.isLoggedIn()) {
      user = this.auth.activeSession.user.username;
    }
    const key = `${IB_TABLE_STORAGE_NAME}/${user}`;
    const stored = this.storage.get(key) || {};
    if (!stored[tableName]) { stored[tableName] = {}; }
    const tableInstance = stored[tableName];
    tableInstance[configName] = config;
    this.storage.set(key, stored);
  }

  loadConfig(tableName, configName): IbTableConfigState{
    let user = IB_TABLE_ANON_USER;
    if (this.auth.isLoggedIn()) {
          user = this.auth.activeSession.user.username;
        }
    const key = `${IB_TABLE_STORAGE_NAME}/${user}`;
    const stored = this.storage.get(key) || {};
    console.log('found stored config', stored);
    if (!stored[tableName]) { stored[tableName] = {}; }
    const tableInstance = stored[tableName];
    let selectedConfig = null;
    if (tableInstance){
      console.log('looking for config:', configName, 'in instance', tableName);
      if (configName){
        return tableInstance[configName] || null;
      }
      for (const config of Object.keys(tableInstance)){
        selectedConfig = tableInstance[config];
        if (tableInstance[config].default){
          break;
        }
      }
      console.log('instance', tableInstance, 'config', selectedConfig);
      return selectedConfig;
    }
    return null;
  }

}
