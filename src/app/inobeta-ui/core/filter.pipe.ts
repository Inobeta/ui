import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterBy",
  standalone: true,
})
/** @deprecated this element will be removed in v21 */
export class IbFilterPipe implements PipeTransform {
  transform(items: string[], query: string): string[] {
    if (!items) {
      return [];
    }

    if (!query) {
      return items;
    }

    return items.filter((i) =>
      i.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
  }
}
