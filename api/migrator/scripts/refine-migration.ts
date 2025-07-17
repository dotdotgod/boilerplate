import * as fs from 'fs';
import * as nReadLines from 'n-readlines';

async function processLineByLine(filePath: string) {
  if (!filePath) {
    return;
  }
  const timeIdx = filePath.split('-')[0];
  const dummyLines = new nReadLines('./migrator/scripts/dummy-migration.txt');

  const isExistTmpDir = fs.existsSync('./migrator/tmp');
  if (!isExistTmpDir) fs.mkdirSync('./migrator/tmp');
  fs.renameSync(
    `./migrator/migrations/${filePath}`,
    `./migrator/tmp/${filePath}`,
  );

  const targetLines = new nReadLines(`./migrator/tmp/${filePath}`);

  let line;
  let lineNumber = 1;
  let targetLine;
  let refineData = '';

  const dummyQuery: string[] = [];
  while ((line = dummyLines.next())) {
    dummyQuery.push(line.toString('ascii'));
  }

  while ((targetLine = await targetLines.next())) {
    if (targetLine.length > 0) {
      const tablessLine = targetLine.toString().trim();

      if (dummyQuery.includes(tablessLine)) {
        console.log(`\x1b[36m Line ${lineNumber} included! \x1b[0m`);
        console.log(`${tablessLine}`);
      } else {
        console.log(`\x1b[31m Line ${lineNumber} not included!: \x1b[0m`);
        console.log(`${tablessLine}`);
        refineData += targetLine.toString() + '\n';
      }
    } else {
      refineData += targetLine.toString() + '\n';
      console.log(`\x1b[35m Line ${lineNumber} skipped!`);
    }
    lineNumber++;
  }

  fs.writeFile(
    `./migrator/migrations/${filePath}`,
    refineData,
    'utf8',
    (err) => {
      if (err) {
        console.error(err);
      }
      console.error(
        `\x1b[33mCheck /migrator/tmp/${timeIdx}-tmp-schema.ts & Delete file! \x1b[0m`,
      );
      // file written successfully
    },
  );
}

async function refineMigration(): Promise<void> {
  let lastMigrationFile: string | undefined;
  const fsp = fs.promises;
  const files = await fsp.readdir('./migrator/migrations/');
  for (const filename of files) {
    lastMigrationFile = filename;
  }
  if (lastMigrationFile) {
    console.log(`${lastMigrationFile} Migration file is refining... `);
    await processLineByLine(lastMigrationFile);
  } else {
    console.log('No migration files found.');
  }
}

refineMigration();
