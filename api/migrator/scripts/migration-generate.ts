import { execSync } from 'child_process';

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Migration name is required');
  process.exit(1);
}

const migrationPath = `migrator/migrations/${migrationName}`;

execSync(
  `pnpm run typeorm migration:generate --dataSource ./migrator/scripts/migration.config.ts ${migrationPath}`,
  { stdio: 'inherit' },
);
