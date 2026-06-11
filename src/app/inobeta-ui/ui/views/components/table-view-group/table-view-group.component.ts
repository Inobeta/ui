import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
  inject,
  signal,
} from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { IbViewList } from "../view-list/view-list.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { DEFAULT_VIEW_ID, IbViewSnapshot } from "../../view.types";
import { IbViewService } from "../../view.service";

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
  standalone: true,
  imports: [IbViewList, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class IbTableViewGroup implements OnInit, OnDestroy {
  @Input() groupName: string = "";
  @Input() componentType: string = "";
  @Input() stateAccessor: () => unknown = () => ({});
  @Input() initialViewId: string | null = null;
  @Input() stateChanges$: Observable<unknown> | null = null;

  @Output() ibViewChanged = new EventEmitter<IbViewSnapshot>();

  views = signal<IbViewSnapshot[]>([]);
  activeView = signal<IbViewSnapshot>(this._buildDefaultView());
  dirty = signal<boolean>(false);

  private _destroyed = new Subject<void>();
  viewService = inject(IbViewService);

  get defaultView(): IbViewSnapshot {
    return this._buildDefaultView();
  }

  ngOnInit(): void {
    this._reloadViews();

    if (this.initialViewId !== null) {
      const foundView = this.views().find((view) => view.id === this.initialViewId);
      if (foundView) {
        this.activeView.set(foundView);
        this.dirty.set(false);
        this.ibViewChanged.emit({ ...foundView, initial: true });
      } else {
        this.activeView.set(this._buildDefaultView());
        this.dirty.set(false);
      }
    }

    if (this.stateChanges$) {
      this.stateChanges$
        .pipe(takeUntil(this._destroyed))
        .subscribe(() => this.dirty.set(this._checkDirty()));
    }
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private _buildDefaultView(): IbViewSnapshot {
    return {
      id: DEFAULT_VIEW_ID,
      name: "",
      groupName: this.groupName,
      componentType: this.componentType,
      data: {},
    };
  }

  private _checkDirty(): boolean {
    const current = this.stateAccessor();
    if (current === undefined) {
      return false;
    }

    return this._serialize(current) !== this._serialize(this.activeView().data);
  }

  private _serialize(state: unknown): string {
    if (state === null || typeof state !== "object") {
      return JSON.stringify(state);
    }

    const objectValue = state as Record<string, unknown>;
    return JSON.stringify(objectValue, Object.keys(objectValue).sort());
  }

  private _reloadViews(): void {
    this.views.set(this.viewService.getViews(this.groupName, this.componentType));
  }

  private _withoutInitial(view: IbViewSnapshot): IbViewSnapshot {
    const { initial: _initial, ...snapshot } = view;
    return snapshot;
  }

  private _setActiveView(view: IbViewSnapshot): void {
    this.activeView.set({ ...view, initial: false });
    this.dirty.set(false);
    this.ibViewChanged.emit({ ...view, initial: false });
  }

  handleAddView(): void {
    this.viewService.openAddViewDialog().subscribe(({ name }) => {
      const view = this.viewService.addView({
        name,
        groupName: this.groupName,
        componentType: this.componentType,
        data: this.stateAccessor(),
      });
      this._reloadViews();
      this._setActiveView(view);
    });
  }

  handleRemoveView(view: IbViewSnapshot): void {
    const snapshot = this._withoutInitial(view);
    this.viewService.openDeleteViewDialog(view).subscribe(() => {
      this.viewService.deleteView(snapshot);
      this._reloadViews();
      this._setActiveView(this._buildDefaultView());
    });
  }

  handleRenameView(view: IbViewSnapshot): void {
    const snapshot = this._withoutInitial(view);
    this.viewService.openRenameViewDialog(view).subscribe(({ name }) => {
      const renamedView = this.viewService.renameView(snapshot, name);
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
      this._withoutInitial(currentActiveView),
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
            name: newView.name,
            groupName: this.groupName,
            componentType: this.componentType,
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
            this._withoutInitial(currentActiveView),
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
