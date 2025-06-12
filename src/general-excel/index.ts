import * as srk from '@algoux/standard-ranklist';
import {
  resolveText,
  formatTimeDuration,
  secToTimeStr,
  numberToAlphabet,
  convertToStaticRanklist,
  resolveUserMarkers,
} from '@algoux/standard-ranklist-utils';
import * as XLSX from 'xlsx';
import { SrkConverter, SrkExcelConverter } from '../types';

export class GeneralExcelConverter implements SrkConverter, SrkExcelConverter {
  public convert(ranklist: srk.Ranklist): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    const aoa = this.convertToAoa(ranklist);
    const mainWorksheet = XLSX.utils.aoa_to_sheet(aoa);
    mainWorksheet['!cols'] = [
      ...ranklist.series.map((s) => ({ wch: 10 })),
      { wch: 10 },
      { wch: 10 },
      { wch: 25 },
      { wch: 40 },
      { wch: 10 },
      { wch: 10 },
      ...ranklist.problems.map((p) => ({ wch: 15 })),
    ];
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, 'Main');

    const aoaHeader = aoa[0];
    const aoaBody = aoa.slice(1);
    // sub worksheet: official
    const officialWorksheet = XLSX.utils.aoa_to_sheet([
      aoaHeader,
      ...aoaBody.filter((_, index) => ranklist.rows[index].user.official !== false),
    ]);
    officialWorksheet['!cols'] = mainWorksheet['!cols'];
    XLSX.utils.book_append_sheet(workbook, officialWorksheet, 'Official');
    // sub worksheet: unofficial
    const unofficialWorksheet = XLSX.utils.aoa_to_sheet([
      aoaHeader,
      ...aoaBody.filter((_, index) => ranklist.rows[index].user.official === false),
    ]);
    unofficialWorksheet['!cols'] = mainWorksheet['!cols'];
    XLSX.utils.book_append_sheet(workbook, unofficialWorksheet, 'Unofficial');
    // sub worksheets: by marker
    const markers = (ranklist.markers || []).filter((m) =>
      ranklist.rows.some((r) => resolveUserMarkers(r.user, ranklist.markers).find((um) => um.id === m.id)),
    );
    for (const marker of markers) {
      const markerLabel = resolveText(marker.label || '--');
      const worksheet = XLSX.utils.aoa_to_sheet([
        aoaHeader,
        ...aoaBody.filter((_, index) =>
          resolveUserMarkers(ranklist.rows[index].user, ranklist.markers).find((um) => um.id === marker.id),
        ),
      ]);
      worksheet['!cols'] = mainWorksheet['!cols'];
      XLSX.utils.book_append_sheet(workbook, worksheet, markerLabel);
    }
    return workbook;
  }

  public convertAndWrite(ranklist: srk.Ranklist, filename: string): any {
    return XLSX.writeFile(this.convert(ranklist), filename, { compression: true });
  }

  private convertToAoa(originalRanklist: srk.Ranklist): string[][] {
    const ranklist = convertToStaticRanklist(originalRanklist);
    const aoa: string[][] = [];
    aoa.push([
      ...ranklist.series.map((s) => s.title!),
      'Markers',
      'Official',
      'Organization',
      'Name',
      'Score',
      'Time',
      ...ranklist.problems.map((p, index) => {
        let str = `${p.alias || numberToAlphabet(index)}`;
        if (p.statistics) {
          str += ` (${p.statistics.accepted}/${p.statistics.submitted})`;
        }
        return str;
      }),
    ]);
    for (const row of ranklist.rows) {
      const arr: string[] = [];
      const { rankValues, user, score, statuses } = row;
      rankValues.forEach((v, index) => {
        if (v.rank === null) {
          arr.push(user.official === false ? '*' : '');
        } else if (typeof v.segmentIndex === 'number') {
          arr.push(`${v.rank} (${ranklist.series[index].segments?.[v.segmentIndex]?.title || '--'})`);
        } else {
          arr.push(`${v.rank}`);
        }
      });
      const userMarkers = resolveUserMarkers(user, ranklist.markers);
      arr.push(userMarkers.length ? userMarkers.map((um) => resolveText(um.label)).join(', ') : '');
      arr.push(user.official === false ? '*' : '');
      arr.push(resolveText(user.organization));
      arr.push(resolveText(user.name));
      arr.push(`${score.value || 0}`);
      arr.push(secToTimeStr(formatTimeDuration(score.time || [0, 's'], 's', (v) => Math.floor(v))));
      for (const status of statuses) {
        const { result, time, tries } = status;
        if (!result) {
          arr.push('');
          continue;
        }
        const timeSec = time ? formatTimeDuration(time, 's', (v) => Math.floor(v)) : undefined;
        if (result === 'AC' || result === 'FB') {
          arr.push(`${result}/${tries!}/${secToTimeStr(timeSec!)}`);
          continue;
        }
        arr.push(`${result}/${tries!}`);
      }
      aoa.push(arr);
    }
    return aoa;
  }
}
