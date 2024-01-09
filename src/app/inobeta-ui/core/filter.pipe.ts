import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filterBy",
  standalone: true,
})
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
