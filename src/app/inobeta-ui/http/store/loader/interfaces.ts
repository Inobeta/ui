export interface IbLoaderState{
  pendingRequests: number;
  showLoading: boolean;
  skipShow: boolean;
  pendingRequestList: { url: string, method: string}[]
}
