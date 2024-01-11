import { Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";

@Injectable()
export class IbTablePaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  itemsPerPageLabel;
  nextPageLabel;
  previousPageLabel;
  firstPageLabel;
  lastPageLabel;

  constructor(private translate: TranslateService) {
    this.setLabels();
    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      this.setLabels();
      this.changes.next();
    });
  }

  setLabels() {
    this.itemsPerPageLabel = this.translate.instant(
      "shared.ibTable.paginator.itemsPerPageLabel"
    );
    this.nextPageLabel = this.translate.instant(
      "shared.ibTable.paginator.nextPageLabel"
    );
    this.previousPageLabel = this.translate.instant(
      "shared.ibTable.paginator.previousPageLabel"
    );
    this.firstPageLabel = this.translate.instant(
      "shared.ibTable.paginator.firstPageLabel"
    );
    this.lastPageLabel = this.translate.instant(
      "shared.ibTable.paginator.lastPageLabel"
    );
  }

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return this.translate.instant("shared.ibTable.paginator.rangeLabel1", {
        length,
      });
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length
        ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return this.translate.instant("shared.ibTable.paginator.rangeLabel2", {
      startIndex: startIndex + 1,
      endIndex,
      length,
    });
  }
}
