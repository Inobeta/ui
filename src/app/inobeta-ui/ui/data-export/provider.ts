export abstract class IbDataExportProvider {
  abstract format: string;
  abstract label: string;
  abstract export(data: any[], filename: string): void
}