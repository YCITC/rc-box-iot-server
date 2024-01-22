import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export interface ReceivedLogInterface {
  id: number;
  deviceId: string;
}

export interface ReceivedLogsInterface {
  items: ReceivedLogInterface[];
  meta: IPaginationMeta;
}
