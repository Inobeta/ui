import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IbTableStubComponent } from './table.stub.spec';

const COMPONENTS = [
  IbTableStubComponent
];

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
export class IbTableTestModule { }
