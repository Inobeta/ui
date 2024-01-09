export abstract class IbDataExportProvider {
  /** Specifies the name of the format to be used in the {@link export} function */
  abstract format: string;
  /** Represents a label or identifier for the data export provider. Concrete implementations should provide a descriptive label. */
  abstract label: string;
  /**
   * This abstract method defines the core functionality for exporting data.
   * Concrete implementations must handle the actual process
   * of exporting data in the specified format.
   *
   * @param data An array of data to be exported
   * @param filename The desired filename for the exported data
   */
  abstract export(data: any[], filename: string): void;
}
