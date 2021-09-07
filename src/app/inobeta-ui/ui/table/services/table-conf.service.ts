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

  saveConfig(tableName, options, config){
    let user = IB_TABLE_ANON_USER;
    const configName = options.data.name;
    if (this.auth.isLoggedIn()) {
      user = this.auth.activeSession.user.username;
    }
    const key = `${IB_TABLE_STORAGE_NAME}/${user}`;
    const stored = this.storage.get(key) || {};
    if (!stored[tableName]) { stored[tableName] = {}; }
    const tableInstance = stored[tableName];
    console.log('options', options)
    if (options.data.selector === 'edit'){
      delete tableInstance[options.selectedConfig];
    }
    console.log('tableInstance', tableInstance)
    if (options.data.default){
      for (const name of Object.keys(tableInstance)){
        tableInstance[name].default = false;
      }
    }
    config.default = options.data.default || false;
    tableInstance[configName] = config;
    this.storage.set(key, stored);
  }

  loadConfig(tableName, configName){
    let user = IB_TABLE_ANON_USER;
    if (this.auth.isLoggedIn()) {
      user = this.auth.activeSession.user.username;
    }
    const key = `${IB_TABLE_STORAGE_NAME}/${user}`;
    const stored = this.storage.get(key) || {};
    console.log('found stored config', stored);
    if (!stored[tableName]) { stored[tableName] = {}; }
    const tableInstance = stored[tableName];
    if (tableInstance){
      console.log('looking for config:', configName, 'in instance', tableName);
      if (configName){
        return tableInstance[configName] ? {config: tableInstance[configName], name: configName} : null;
      }
      for (const config of Object.keys(tableInstance)){
        if (tableInstance[config].default){
          return {config: tableInstance[config], name: config};
        }
      }
    }
    return null;
  }

  getConfigsByTableName(tableName) {
    let user = IB_TABLE_ANON_USER;
    if (this.auth.isLoggedIn()) {
      user = this.auth.activeSession.user.username;
    }
    const key = `${IB_TABLE_STORAGE_NAME}/${user}`;
    const stored = this.storage.get(key) || {};

    const instanceExists = (tableName in stored);
    if (!instanceExists) {
      return null;
    }
    const instance = stored[tableName];
    return Object.keys(instance);
  }
  
}
