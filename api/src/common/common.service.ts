import * as dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { User } from 'src/user/entities/user.entity';
import { Oauth } from 'src/user/entities/oauth.entity';
import { EmailVerification } from 'src/user/entities/email-verification.entity';
import { RefreshToken } from 'src/user/entities/refresh-token.entity';

dotenv.config({ path: `${process.cwd()}/../.env` });

export class CommonService {
  constructor(private readonly env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];

    if (value === undefined && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value || '';
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getTypeOrmConfig: () => PostgresConnectionOptions = () => ({
    type: 'postgres',
    host: this.getValue('DB_HOST'),
    port: parseInt(this.getValue('DB_PORT')),
    username: this.getValue('DB_USER'),
    password: this.getValue('DB_PASS'),
    database: this.getValue('DB_DATABASE'),
    entities: [User, Oauth, EmailVerification, RefreshToken],
    logging: this.getValue('NODE_ENV') === 'debug' || ['warn', 'error'],
    synchronize: false,
    autoLoadEntities: true,
  });
}

const commonService = new CommonService(process.env).ensureValues([
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASS',
  'DB_DATABASE',
]);

export { commonService };
