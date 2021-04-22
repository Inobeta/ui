export interface IbModalMessage {
  title: string;
  message: string;
  hasYes?: boolean;
  hasNo?: boolean;
  actions?: {label: string, value: any, color?: string }[];
}
