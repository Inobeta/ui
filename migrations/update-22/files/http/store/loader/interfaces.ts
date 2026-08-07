export interface IbLoaderState{
  showLoading: boolean;
  skipShow: boolean;
  pendingRequestList: ibRequestHttp[];
}

export type ibRequestHttp = { url: string, method: string}
