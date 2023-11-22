import { createAction } from "@ngrx/store";

export const ibLoaderActions = {
    incLoading: createAction('[Http/Loader] incLoading'),
    decLoading: createAction('[Http/Loader] decLoading'),
    skipShow: createAction('[Http/Loader] skipShow'),
}
