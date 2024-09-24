export type IbModalMessage = {
  /** Display title heading. Supports i18n. */
  title: string;
  /** Display message. Supports i18n. */
  message: string;
  /** Whether display a button with a positive response */
  hasYes?: boolean;
  /** Whether display a button with a negative response */
  hasNo?: boolean;
  /**
   * List of buttons to display
   * Example:
   *
   * ```typescript
   * {
   *   actions: [{
   *     // Button label. Supports i18n.
   *     label: 'common.next',
   *     // Value returned in the subscription
   *     value: 'next',
   *     // Default is 'basic'
   *     color: 'primary'
   *   }]
   * }
   * ```
   */
  actions?: { label: string; value: any; color?: string }[];
  /** Defaults to 350px */
  minWidth?: string;
  /** Defaults to 10vh */
  minHeight?: string;
}
