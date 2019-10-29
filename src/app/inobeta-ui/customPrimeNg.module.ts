import {NgModule} from '@angular/core';
import {MenuModule} from 'primeng/menu';
import {ButtonModule} from 'primeng/button';
import {
  AccordionModule,
  AutoCompleteModule,
  CalendarModule,
  CheckboxModule,
  ConfirmDialogModule,
  DragDropModule,
  DropdownModule,
  FileUploadModule,
  InputTextModule,
  PanelMenuModule
} from 'primeng/primeng';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {TableModule} from 'primeng/table';
import {MessageService} from 'primeng/components/common/messageservice';
import {GrowlModule} from 'primeng/growl';
import {TabViewModule} from 'primeng/tabview';
import {PanelModule} from 'primeng/panel';
import {TreeModule} from 'primeng/tree';
import {ConfirmationService, TreeDragDropService} from 'primeng/api';

@NgModule({
  exports: [
    MenuModule,
    ButtonModule,
    PanelMenuModule,
    CheckboxModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    MessagesModule,
    MessageModule,
    GrowlModule,
    TabViewModule,
    FileUploadModule,
    AccordionModule,
    PanelModule,
    DragDropModule,
    TreeModule,
    TabViewModule,
    ConfirmDialogModule,
    AutoCompleteModule
  ],
  providers: [
    MessageService,
    TreeDragDropService,
    ConfirmationService
  ],
  imports: [

  ]
})
export class CustomPrimeNgModule {}
