export interface TableView {
  id: string;
  name: string;
  tableName: string;
  filter: Record<string, any>;
  pageSize?: number;
}
