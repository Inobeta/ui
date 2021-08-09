import { IbTableTitles } from "../../models/titles.model";

interface IStickyColumnData {
  key?: string;
  sticky?: string | boolean;
}

export type StickyColumnData = IStickyColumnData | IbTableTitles;