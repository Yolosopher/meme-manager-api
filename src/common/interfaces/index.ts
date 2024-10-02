export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  next_page?: number;
  prev_page?: number;
}

export type OrderByDir = 'asc' | 'desc';
