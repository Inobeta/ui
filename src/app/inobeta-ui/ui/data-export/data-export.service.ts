import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbTableDataExportDialog } from './table-data-export-dialog.componen';

@Injectable({providedIn: 'root'})
export class IbDataExportService {
  constructor(private dialog: MatDialog) { }
  
  openDialog(data: any) {
    return this.dialog.open(IbTableDataExportDialog, {
      width: "350px",
      data,
    }).afterClosed().subscribe(data => console.log(data));
  }
}