export interface FormData {
  name: string;
  ip: string;
  MAC: string;
  type: string;
  sharedComputer?: boolean;
  primaryUser?: string | null;
  note?: string;
  [key: string]: string | boolean | null | undefined;
}
