import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1753326167668 implements MigrationInterface {
  name = 'Init1753326167668';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP CONSTRAINT "FK_639b5775145fb76279ffa6f0ee5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" RENAME COLUMN "userId" TO "origin_response"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "verified_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP COLUMN "origin_response"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD "origin_response" jsonb NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1e31b84cedaa9135fd13ca162" ON "oauth" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD CONSTRAINT "UQ_dc737874eae2b835bc9ef8bdbab" UNIQUE ("user_id", "provider_id", "provider")`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD CONSTRAINT "FK_c1e31b84cedaa9135fd13ca1620" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP CONSTRAINT "FK_c1e31b84cedaa9135fd13ca1620"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP CONSTRAINT "UQ_dc737874eae2b835bc9ef8bdbab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c1e31b84cedaa9135fd13ca162"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP COLUMN "origin_response"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD "origin_response" integer`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "verified_at"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_verified"`);
    await queryRunner.query(
      `ALTER TABLE "oauth" RENAME COLUMN "origin_response" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD CONSTRAINT "FK_639b5775145fb76279ffa6f0ee5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
