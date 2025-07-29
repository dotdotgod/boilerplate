import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1753820860849 implements MigrationInterface {
    name = 'Init1753820860849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."oauth_provider_enum" AS ENUM('google', 'apple', 'facebook')`);
        await queryRunner.query(`CREATE TABLE "oauth" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "provider" "public"."oauth_provider_enum" NOT NULL, "provider_id" character varying NOT NULL, "origin_response" jsonb NOT NULL, CONSTRAINT "UQ_e821cdcf33b1359bef666881d7a" UNIQUE ("uuid"), CONSTRAINT "UQ_dc737874eae2b835bc9ef8bdbab" UNIQUE ("user_id", "provider_id", "provider"), CONSTRAINT "PK_a957b894e50eb16b969c0640a8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e821cdcf33b1359bef666881d7" ON "oauth" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_c1e31b84cedaa9135fd13ca162" ON "oauth" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "is_verified" boolean NOT NULL DEFAULT false, "verified_at" TIMESTAMP, CONSTRAINT "UQ_a95e949168be7b7ece1a2382fed" UNIQUE ("uuid"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a95e949168be7b7ece1a2382fe" ON "user" ("uuid") `);
        await queryRunner.query(`CREATE TABLE "email_verification" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer, "email" character varying NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_6614068485f5d2da4622b921c25" UNIQUE ("uuid"), CONSTRAINT "UQ_dfd82813f24e0ba651daa7eb933" UNIQUE ("token"), CONSTRAINT "PK_b985a8362d9dac51e3d6120d40e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6614068485f5d2da4622b921c2" ON "email_verification" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_e7eb5e3c3dd984d69f6eb1cdf1" ON "email_verification" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3ffc9210f041753e837b29d9e5" ON "email_verification" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_dfd82813f24e0ba651daa7eb93" ON "email_verification" ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_6675cbe407d9e12a6a4579265c" ON "email_verification" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_681a5abebb0f251d686e92c5e8" ON "email_verification" ("email", "token") `);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP NOT NULL, CONSTRAINT "UQ_aad39563a6e8926ed904bde2878" UNIQUE ("uuid"), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aad39563a6e8926ed904bde287" ON "refresh_token" ("uuid") `);
        await queryRunner.query(`CREATE INDEX "IDX_6bbe63d2fe75e7f0ba1710351d" ON "refresh_token" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0812282fad2e352cdaf83ef0a" ON "refresh_token" ("token_hash") `);
        await queryRunner.query(`CREATE INDEX "IDX_e888ad854be5ebd601c775455e" ON "refresh_token" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_e483478c92e90533489bc10dfe" ON "refresh_token" ("user_id", "token_hash") `);
        await queryRunner.query(`ALTER TABLE "oauth" ADD CONSTRAINT "FK_c1e31b84cedaa9135fd13ca1620" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "email_verification" ADD CONSTRAINT "FK_e7eb5e3c3dd984d69f6eb1cdf1c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`);
        await queryRunner.query(`ALTER TABLE "email_verification" DROP CONSTRAINT "FK_e7eb5e3c3dd984d69f6eb1cdf1c"`);
        await queryRunner.query(`ALTER TABLE "oauth" DROP CONSTRAINT "FK_c1e31b84cedaa9135fd13ca1620"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e483478c92e90533489bc10dfe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e888ad854be5ebd601c775455e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0812282fad2e352cdaf83ef0a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6bbe63d2fe75e7f0ba1710351d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aad39563a6e8926ed904bde287"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_681a5abebb0f251d686e92c5e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6675cbe407d9e12a6a4579265c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dfd82813f24e0ba651daa7eb93"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3ffc9210f041753e837b29d9e5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e7eb5e3c3dd984d69f6eb1cdf1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6614068485f5d2da4622b921c2"`);
        await queryRunner.query(`DROP TABLE "email_verification"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a95e949168be7b7ece1a2382fe"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1e31b84cedaa9135fd13ca162"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e821cdcf33b1359bef666881d7"`);
        await queryRunner.query(`DROP TABLE "oauth"`);
        await queryRunner.query(`DROP TYPE "public"."oauth_provider_enum"`);
    }

}
