import { IbStorageTypes } from './storage.service';

export class IbStorageServiceStub{
  set(key: string, object: any, storageType: IbStorageTypes = IbStorageTypes.LOCALSTORAGE){
  }

  get(key: string, storageType: IbStorageTypes = IbStorageTypes.LOCALSTORAGE): any{
  }
}
