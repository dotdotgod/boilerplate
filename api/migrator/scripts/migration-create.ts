import yargs from 'yargs';
import { execSync } from 'child_process';

// Construct the migration path
const migrationPath = `migrator/migrations/${yargs.argv['_'][0]}`;

// Run the typeorm command
execSync(`pnpm run typeorm migration:create ${migrationPath}`, {
  stdio: 'inherit',
});
