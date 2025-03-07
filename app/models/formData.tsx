export interface FormData {
  name: string;
  ip: string;
  MAC: string;
  type: string;
  sharedComputer?: boolean;
  primaryUser?: string;
  note?: string;
  [key: string]: any;
}
