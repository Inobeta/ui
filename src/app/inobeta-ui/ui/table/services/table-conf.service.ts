import { Injectable } from '@angular/core';
import { IbAuthService } from '../../../http/auth/auth.service';
import { IbStorageService } from '../../../storage/storage.service';

export const IB_TABLE_STORAGE_NAME = 'ib-table-store';
export const IB_TABLE_ANON_USER = 'ib-anon';

/**
 * @deprecated Use IbKaiTableModule
 */
@Injectable({providedIn: 'root'})
export class IbTableConfService {
  private user = IB_TABLE_ANON_USER;
  private key = `${IB_TABLE_STORAGE_NAME}/${this.user}`;

  constructor(
    private storage: IbStorageService,
    private auth: IbAuthService<any>
  ) { }

  saveConfig(tableName, options, config){
    const configName = options.data.name;
    const [error, stored, instance] = this.loadFromStorage(tableName);

    if (options.data.selector === 'edit'){
      delete instance[options.selectedConfig];
    }

    if (options.data.default){
      for (const name of Object.keys(instance)) {
        console.log(instance[name])
        instance[name].default = false;
      }
    }
    config.default = options.data.default || false;
    config.paginator.pageIndex = 0;

    instance[configName] = config;
    this.storage.set(this.key, {
      ...stored,
      [tableName]: instance
    });
  }

  loadConfig(tableName, configName){
    const [error, stored, instance, config] = this.loadFromStorage(tableName, configName);
    if (error) {
      return null;
    }

    if (config) {
      return { config, name: configName };
    }

    if (instance) {
      for (const name of Object.keys(instance)){
        if (instance[name].default) {
          return {config: instance[name], name};
        }
      }
    }
    return null;
  }

  deleteConfig(tableName, configName) {
    const [error, stored, instance] = this.loadFromStorage(tableName, configName);
    if (error) {
      return [true, null];
    }

    delete instance[configName];
    this.storage.set(this.key, stored);
    return [false, instance];
  }

  toggleDefault(tableName, configName) {
    const [error, stored, instance, config] = this.loadFromStorage(tableName, configName);
    if (error) {
      return [true, null];
    }

    const previousValue = config.default;
    Object.values<any>(instance).some(c => c.default && (c.default = false));
    config.default = !previousValue;

    this.storage.set(this.key, stored);
    return [false, instance];
  }

  getConfigsByTableName(tableName) {
    return this.loadFromStorage(tableName);
  }

  private loadFromStorage(tableName: string, configName?: string) {
    if (this.auth.isLoggedIn()) {
      this.user = this.auth.activeSession.user.username;
    }
    const stored = this.storage.get(this.key) || {};

    const instanceExists = (tableName in stored);
    if (!instanceExists) {
      return [true, stored, {}, null];
    }

    const instance = stored[tableName];

    if (!configName) {
      return [false, stored, instance, null];
    }

    const configExists = (configName in instance);
    if (!configExists) {
      return [true, stored, instance, null];
    }

    const config = instance[configName];
    return [false, stored, instance, config];
  }
}
