import * as srk from '@algoux/standard-ranklist';
import { resolveText, formatTimeDuration, secToTimeStr } from '@algoux/standard-ranklist-utils';
import * as XLSX from 'xlsx';
import { SrkConverter, SrkExcelConverter } from '../types';

export class VJudgeReplayConverter implements SrkConverter, SrkExcelConverter {
  public convert(ranklist: srk.Ranklist): XLSX.WorkBook {
    const aoa = this.convertToAoa(ranklist);
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Main');
    return workbook;
  }

  public convertAndWrite(ranklist: srk.Ranklist, filename: string): any {
    return XLSX.writeFile(this.convert(ranklist), filename, { compression: true });
  }

  private convertToAoa(ranklist: srk.Ranklist): string[][] {
    const aoa: string[][] = [];
    for (const row of ranklist.rows) {
      const arr: string[] = [];
      const { user, statuses } = row;
      let name = resolveText(user.name);
      if (user.organization) {
        name = `${name} (${resolveText(user.organization)})`;
      }
      if (user.official === false) {
        name = `*${name}`;
      }
      arr.push(name);
      for (const status of statuses) {
        const { result, time, tries } = status;
        if (!result) {
          arr.push('');
          continue;
        }
        const timeSec = time ? formatTimeDuration(time, 's', (v) => Math.floor(v)) : undefined;
        if (result === 'AC' || result === 'FB') {
          arr.push(`${secToTimeStr(timeSec!)}/${tries!}`);
          continue;
        }
        arr.push(`(-${tries!})`);
      }
      aoa.push(arr);
    }
    return aoa;
  }
}
