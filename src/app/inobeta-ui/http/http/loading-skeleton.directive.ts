import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { ibSelectIsHttpLoading, ibSelectIsHttpUrlLoading } from "../store/loader/selectors";
import { Observable, Subscription } from "rxjs";
import { IbLoadingSkeletonContainerComponent } from "./loading-skeleton-container.component";

const defaultConfig = {
  size: 1,
  width: 'rand',
  height: '20px',
  className: '',
  endpoint: null
}

@Directive({ selector: '[ibLoading]' })
export class IbLoadingDirective implements OnInit, OnDestroy{
  isLoading$ = this.store.select(ibSelectIsHttpLoading)
  isLoadingSpecificUrl$: Observable<boolean> | null = null;
  @Input('ibLoading') config: {
    size?: number;
    width?: string;
    height?: string;
    className?: string;
    endpoint?: { url: string, method: string} | null
  } = { ...defaultConfig }

  loadingSub?: Subscription;
  constructor(private tpl: TemplateRef<any>,
              private vcr: ViewContainerRef,
              private store: Store
              ) {}

  ngOnInit(): void {
  console.log('ibLoad init')
    const {
      size, width, height, className, endpoint
    } = {
      ...defaultConfig,
      ...this.config
    }
    const renderCb = (isLoading) => {
      this.vcr.clear();
      console.log('ibLoad render', isLoading)
      if (isLoading) {
        const ref = this.vcr.createComponent(IbLoadingSkeletonContainerComponent);
        Object.assign(ref.instance, {
          skeletons: Array.from({ length: size }).map(() => ({
            width: width === 'rand' ? `${30 + 60 * Math.random()}%` : width,
            height: height,
            className: className
          }))
        })
      } else {
        this.vcr.createEmbeddedView(this.tpl);
      }
    }
    if(endpoint){
      this.isLoadingSpecificUrl$ = this.store.select(ibSelectIsHttpUrlLoading(endpoint))
      this.loadingSub = this.isLoadingSpecificUrl$.subscribe(renderCb)
    }
    else{
      this.loadingSub = this.isLoading$.subscribe(renderCb)
    }
  }

  ngOnDestroy(): void {
    this.loadingSub?.unsubscribe()
  }

}
