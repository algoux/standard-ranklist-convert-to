import * as srk from '@algoux/standard-ranklist';
import {
  resolveText,
  formatTimeDuration,
  numberToAlphabet,
  getSortedCalculatedRawSolutions,
} from '@algoux/standard-ranklist-utils';
import { SrkConverter, SrkCodeforcesGymGhostDATConverter, CodeforcesGymGhostDATFileInfo } from '../types';

export class CodeforcesGymGhostDATConverter implements SrkConverter, SrkCodeforcesGymGhostDATConverter {
  public convert(ranklist: srk.Ranklist): CodeforcesGymGhostDATFileInfo {
    return {
      type: 'string',
      content: this.convertToGymGhostLines(ranklist).join('\n'),
      encoding: 'utf8',
      ext: 'dat',
    };
  }

  private convertToGymGhostLines(ranklist: srk.Ranklist): string[] {
    const lns: string[] = [];
    this.appendLine(lns, 'contest', JSON.stringify(resolveText(ranklist.contest.title)));
    this.appendLine(
      lns,
      'contlen',
      formatTimeDuration(ranklist.contest.duration, 'min', (v) => Math.floor(v)),
    );
    this.appendLine(lns, 'problems', ranklist.problems.length);
    this.appendLine(lns, 'teams', ranklist.rows.length);
    const solutions = getSortedCalculatedRawSolutions(ranklist.rows);
    this.appendLine(lns, 'submissions', solutions.length);
    const penalty = formatTimeDuration(ranklist.sorter?.config?.penalty || [20, 'min'], 'min', (v) => Math.floor(v));
    ranklist.problems.forEach((p, index) => {
      const alias = p.alias || numberToAlphabet(index);
      this.appendLine(lns, 'p', alias, alias, penalty, 0);
    });
    const tempUserIdMap = new Map<string, number>();
    ranklist.rows.forEach((r, index) => {
      tempUserIdMap.set(r.user.id, index + 1);
      let name = resolveText(r.user.name);
      if (r.user.organization) {
        name += ` (${resolveText(r.user.organization)})`;
      }
      if (r.user.official === false) {
        name = '*' + name;
      }
      this.appendLine(lns, 't', index + 1, 0, 1, name);
    });
    const userSolutionStatusesMap = new Map<string, number>();
    solutions.forEach((s) => {
      const [userId, problemIndex, result, time] = s;
      if (!result || result === '?') {
        return;
      }
      const tempUserId = tempUserIdMap.get(userId)!;
      const problemAlias = ranklist.problems[problemIndex].alias || numberToAlphabet(problemIndex);
      const solutionStatusesKey = `${tempUserId}_${problemIndex}`;
      if (!userSolutionStatusesMap.has(solutionStatusesKey)) {
        userSolutionStatusesMap.set(solutionStatusesKey, 0);
      }
      const solutionStatusesCount = userSolutionStatusesMap.get(solutionStatusesKey)!;
      const timeSec = formatTimeDuration(time, 's', (v) => Math.floor(v));
      const resultStr = result === 'AC' || result === 'FB' ? 'OK' : 'RJ';
      this.appendLine(lns, 's', tempUserId, problemAlias, solutionStatusesCount + 1, timeSec, resultStr);
      userSolutionStatusesMap.set(solutionStatusesKey, solutionStatusesCount + 1);
    });

    return lns;
  }

  private appendLine(lns: string[], type: string, ...items: (number | string)[]): void {
    lns.push(`@${type} ${items.join(',')}`);
  }
}
