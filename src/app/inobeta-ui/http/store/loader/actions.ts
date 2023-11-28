import { createAction, props } from "@ngrx/store";

export const ibLoaderActions = {
    incLoading: createAction('[Http/Loader] incLoading', props<{ url: string, method: string}>()),
    decLoading: createAction('[Http/Loader] decLoading', props<{ url: string, method: string}>()),
    skipShow: createAction('[Http/Loader] skipShow'),
}
