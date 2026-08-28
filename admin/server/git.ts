import { execFileSync } from 'node:child_process';
import { REPO_ROOT } from './store.ts';

export interface CommitResult {
  committed: boolean;
  error?: string;
}

/**
 * Stages the given paths and commits them. Never throws: file writes have
 * already happened by the time this runs, so a failed commit (nothing to
 * commit, no git identity configured, etc.) is reported back as a warning
 * rather than treated as a failed request.
 */
export function stageAndCommit(paths: string[], message: string): CommitResult {
  try {
    execFileSync('git', ['add', '--', ...paths], { cwd: REPO_ROOT });
    execFileSync('git', ['commit', '-m', message], { cwd: REPO_ROOT });
    return { committed: true };
  } catch (err) {
    return { committed: false, error: (err as Error).message };
  }
}
