import * as srk from '@algoux/standard-ranklist';
import type * as XLSX from 'xlsx';

export interface GeneralFileInfo<T = 'string' | 'buffer', C = string | ArrayBuffer, E = string> {
  type: T;
  content: C;
  encoding?: string;
  ext: E;
}

export interface SrkConverter {
  convert(ranklist: srk.Ranklist): any;
}

export interface SrkExcelConverter {
  /**
   * Convert a srk to xlsx.
   * @param {srk.Ranklist} ranklist
   * @returns {XLSX.WorkBook} xlsx workbook instance
   */
  convert(ranklist: srk.Ranklist): XLSX.WorkBook;

  /**
   * Convert a srk to xlsx and write.
   * @param {srk.Ranklist} ranklist
   * @param {string} filename filename to write or download, ends with '.xlsx'
   */
  convertAndWrite(ranklist: srk.Ranklist, filename: string): any;
}

export type CodeforcesGymGhostDATFileInfo = GeneralFileInfo<'string', string, 'dat'>;

export interface SrkCodeforcesGymGhostDATConverter {
  /**
   * Convert a srk to Codeforces Gym Ghost DAT file.
   * @param {srk.Ranklist} ranklist
   * @returns {SrkCodeforcesGymGhostDATFileInfo} file info
   */
  convert(ranklist: srk.Ranklist): CodeforcesGymGhostDATFileInfo;
}
