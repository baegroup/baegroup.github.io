import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const printable = [command, ...args].join(' ');
  console.log(`$ ${printable}`);

  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  return result;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let dryRun = false;
  let message = '';

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '-m' || arg === '--message') {
      message = args.slice(i + 1).join(' ').trim();
      break;
    }
  }

  return { dryRun, message };
}

const { dryRun, message } = parseArgs(process.argv);
const commitMessage =
  message ||
  `Update site content ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`;

run('npm', ['run', 'content:build']);

if (dryRun) {
  console.log('Dry run complete. Generated content without committing or pushing.');
  process.exit(0);
}

run('git', ['add', 'content', 'src/content/site-content.generated.json', 'public/data/team.json', 'public/data/publications.json']);

const diffResult = spawnSync('git', ['diff', '--cached', '--quiet'], { stdio: 'ignore' });
if (diffResult.status === 0) {
  console.log('No staged changes detected. Nothing to commit.');
  process.exit(0);
}

run('git', ['commit', '-m', commitMessage]);
run('git', ['push', 'origin', 'main']);

console.log('Publish complete.');
