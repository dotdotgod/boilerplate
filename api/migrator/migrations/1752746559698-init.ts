import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1752746559698 implements MigrationInterface {
  name = 'Init1752746559698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(
      `CREATE TYPE "public"."oauth_provider_enum" AS ENUM('google', 'apple', 'facebook')`,
    );
    await queryRunner.query(
      `CREATE TABLE "oauth" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "provider" "public"."oauth_provider_enum" NOT NULL, "provider_id" character varying NOT NULL, "userId" integer, CONSTRAINT "UQ_e821cdcf33b1359bef666881d7a" UNIQUE ("uuid"), CONSTRAINT "PK_a957b894e50eb16b969c0640a8d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e821cdcf33b1359bef666881d7" ON "oauth" ("uuid") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, CONSTRAINT "UQ_a95e949168be7b7ece1a2382fed" UNIQUE ("uuid"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a95e949168be7b7ece1a2382fe" ON "user" ("uuid") `,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD CONSTRAINT "FK_639b5775145fb76279ffa6f0ee5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP CONSTRAINT "FK_639b5775145fb76279ffa6f0ee5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a95e949168be7b7ece1a2382fe"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e821cdcf33b1359bef666881d7"`,
    );
    await queryRunner.query(`DROP TABLE "oauth"`);
    await queryRunner.query(`DROP TYPE "public"."oauth_provider_enum"`);
  }
}
