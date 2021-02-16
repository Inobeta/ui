import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TableStubComponent } from './table.stub.spec';

const COMPONENTS = [
  TableStubComponent
]

@NgModule({
    declarations: [
        ...COMPONENTS,
    ],
    imports: [
        CommonModule
    ],
    exports: [...COMPONENTS],
    entryComponents: [
    ]
})
export class TableTestModule { }
