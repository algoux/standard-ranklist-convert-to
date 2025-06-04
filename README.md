# standard-ranklist-convert-to

Convert from standard ranklist to other ranklist.

## Usage

Make sure you have installed the `@algoux/standard-ranklist` package, then install this package:

```shell
npm i -S @algoux/standard-ranklist-convert-to
```

## Converters

- [x] `GeneralExcelConverter`: Convert to general excel file.
- [x] `VJudgeReplayConverter`: Convert to VJudge replay xlsx. It's useful to create a replay contest on [Virtual Judge](https://vjudge.net).
- [x] `CodeforcesGymGhostDATConverter`: Convert to Codeforces Gym Ghost file.

## How to use

Import the specified converter and call `convert`:

```typescript
import { GeneralExcelConverter } from '@algoux/standard-ranklist-convert-to';

const ranklist = ...; // your srk object

const converter = new GeneralExcelConverter();
const result = converter.convert(ranklist);
```

For more details, see the declaration of the converter (refer to `index.d.ts`).
