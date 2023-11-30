import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';



/**
* @deprecated Use IbKaiTableModule
*/
export class IbMatPaginatorI18n {

    constructor(private readonly translate: TranslateService) {}

    getPaginatorIntl(): MatPaginatorIntl {
        const paginatorIntl = new MatPaginatorIntl();
        paginatorIntl.itemsPerPageLabel = this.translate.instant('shared.ibTable.paginator.itemsPerPageLabel');
        paginatorIntl.nextPageLabel = this.translate.instant('shared.ibTable.paginator.nextPageLabel');
        paginatorIntl.previousPageLabel = this.translate.instant('shared.ibTable.paginator.previousPageLabel');
        paginatorIntl.firstPageLabel = this.translate.instant('shared.ibTable.paginator.firstPageLabel');
        paginatorIntl.lastPageLabel = this.translate.instant('shared.ibTable.paginator.lastPageLabel');
        paginatorIntl.getRangeLabel = this.getRangeLabel.bind(this);
        return paginatorIntl;
    }

    private getRangeLabel(page: number, pageSize: number, length: number): string {
        if (length === 0 || pageSize === 0) {
            return this.translate.instant('shared.ibTable.paginator.rangeLabel1', { length });
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return this.translate.instant('shared.ibTable.paginator.rangeLabel2', { startIndex: startIndex + 1, endIndex, length });
    }
}
