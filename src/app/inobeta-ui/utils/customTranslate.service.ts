import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class CustomTranslateService {

  constructor(private translateService: TranslateService) {}

  /**
   * Questa funzione traduce array di MenuItem ricorsivamente.
   * @param items l'array di MenuItem da tradurre
   */

  translateMenuItemsLabels(items) {
    const itemLabels: string[] = [];
    items.forEach( item => {
      itemLabels.push(item.label);
    });

    if (itemLabels.length === 0) { return; }

    this.translateService.get(itemLabels).subscribe( res => {
      for (let i = 0; i < itemLabels.length; i++) {
        items[i].label = res[itemLabels[i]];
      }
    });

    items.forEach( item => {
      if (item.items) {
        this.translateMenuItemsLabels(item.items);
      }
    });
  }

  /**
   * Questa funzione trasforma un array di stringhe da tradurre in un array di stringhe tradotte.
   * @param array l'array di stringhe da tradurre
   */

  translateStringsArray(array: string[]) {
    this.translateService.get(array).subscribe( res => {
      for (let i = 0; i < array.length; i++) {
        array[i] = res[array[i]];
      }
    });
  }

  /**
   * Questa funzione traduce un solo field all'interno di una collezione di oggetti,
   * fornendo come parametro il nome del field.
   * Es:
   * userTypes = [
   *   {label: 'account.private', value: UserType.PRIVATE},
   *   {label: 'account.agent', value: UserType.AGENT},
   *   {label: 'account.administrator', value: UserType.ADMINISTRATOR}
   *  ];
   * Chiamando la funzione con i parametri (userTypes, 'label'), l'array verrà trasformato in:
   * userTypes = [
   *    {label: 'Privato', value: UserType.PRIVATE},
   *    {label: 'Agente', value: UserType.AGENT},
   *    {label: 'Amministratore', value: UserType.ADMINISTRATOR}
   *  ];
   * @param collection la collezione da trasformare
   * @param fieldName il nome del field da tradurre
   */

  translateCollectionField(collection, fieldName) {
    const itemLabels: string[] = [];
    collection.forEach( item => {
      itemLabels.push(item[fieldName]);
    });

    this.translateService.get(itemLabels).subscribe( res => {
      for (let i = 0; i < itemLabels.length; i++) {
        collection[i][fieldName] = res[itemLabels[i]];
      }
    });
  }
}
