import { DataSource } from 'typeorm';
import { commonService } from 'src/common/common.service';
import * as path from 'path';

const dataSource = new DataSource({
  ...commonService.getTypeOrmConfig(),
  migrations: [path.join(__dirname, '../migrations/*.ts')],
});
dataSource.initialize();

export default dataSource;
