export interface IbLoaderState{
  showLoading: boolean;
  skipShow: boolean;
  pendingRequestList: { url: string, method: string}[]
}
