import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  signal
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { IbViewService } from "../../view.service";
import { DEFAULT_VIEW_ID, IbViewSnapshot } from "../../view.types";
import { IbViewList } from "../view-list/view-list.component";

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
  standalone: true,
  imports: [IbViewList, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class IbTableViewGroup implements OnInit {
  viewService = inject(IbViewService);

  groupName = input('');
  componentType = input('');
  stateAccessor = input.required<() => unknown>();
  initialViewId = signal<string>('');
  stateChanges = input<Observable<unknown> | null>(null);
  dirty = signal(false);
  ibViewChanged = output<IbViewSnapshot>();

  views = signal<IbViewSnapshot[]>([]);
  activeView = signal<IbViewSnapshot>(this.buildDefaultView());

  ngOnInit(): void {
    this._reloadViews();
    const foundView = this.views().find((view) => view.id === this.initialViewId());
    if (foundView) {
      this.activeView.set(foundView);
      this.dirty.set(false);
      this.ibViewChanged.emit(foundView);
    } else {
      this.activeView.set(this.buildDefaultView());
      this.dirty.set(false);
    }
  }

  buildDefaultView(): IbViewSnapshot {
    return {
      id: DEFAULT_VIEW_ID,
      name: "",
      groupName: this.groupName(),
      componentType: this.componentType(),
      data: {},
    };
  }

  private _reloadViews(): void {
    this.views.set(this.viewService.getViews(this.groupName(), this.componentType()));
  }

  private _setActiveView(view: IbViewSnapshot): void {
    this.activeView.set(view);
    this.dirty.set(false);
    this.ibViewChanged.emit(view);
  }

  handleAddView(): void {
    this.viewService.openAddViewDialog().subscribe(({ name }) => {
      const view = this.viewService.addView({
        name,
        groupName: this.groupName(),
        componentType: this.componentType(),
        data: this.stateAccessor(),
      });
      this._reloadViews();
      this._setActiveView(view);
    });
  }

  handleRemoveView(view: IbViewSnapshot): void {
    this.viewService.openDeleteViewDialog(view).subscribe(() => {
      this.viewService.deleteView(view);
      this._reloadViews();
      this._setActiveView(this.buildDefaultView());
    });
  }

  handleRenameView(view: IbViewSnapshot): void {
    this.viewService.openRenameViewDialog(view).subscribe(({ name }) => {
      const renamedView = this.viewService.renameView(view, name);
      this._reloadViews();
      this._setActiveView(renamedView);
    });
  }

  handleDuplicateView(view: IbViewSnapshot): void {
    this.viewService.openDuplicateViewDialog(view).subscribe(({ name }) => {
      const nextView = this.viewService.duplicateView({
        name,
        groupName: view.groupName,
        componentType: view.componentType,
        data: this.stateAccessor(),
      });
      this._reloadViews();
      this._setActiveView(nextView);
    });
  }

  handleSaveView(): void {
    const currentActiveView = this.activeView();

    if (currentActiveView.id === DEFAULT_VIEW_ID) {
      this.handleAddView();
      return;
    }

    const view = this.viewService.saveView(
      currentActiveView,
      this.stateAccessor(),
    );
    this._reloadViews();
    this._setActiveView(view);
  }

  handleChangeView(view: IbViewSnapshot): void {
    if (!this.dirty()) {
      this._setActiveView(view);
      return;
    }

    const currentActiveView = this.activeView();
    if (currentActiveView.id === DEFAULT_VIEW_ID) {
      this.viewService.openSaveAsDialog().subscribe((newView) => {
        if (newView.confirmed) {
          this.viewService.addView({
            name: newView.name ?? '',
            groupName: this.groupName(),
            componentType: this.componentType(),
            data: this.stateAccessor(),
          });
          this._reloadViews();
        }
        this._setActiveView(view);
      });
      return;
    }

    this.viewService
      .openSaveChangesDialog(currentActiveView)
      .subscribe((result) => {
        if (result.confirmed) {
          this.viewService.saveView(
            currentActiveView,
            this.stateAccessor(),
          );
          this._reloadViews();
        }
        this._setActiveView(view);
      });
  }

  handleDiscardChanges(): void {
    this._setActiveView(this.activeView());
  }
}
