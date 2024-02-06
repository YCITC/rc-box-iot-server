import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export interface PaginateInterface<T> {
  items: T[];
  meta: IPaginationMeta;
}
