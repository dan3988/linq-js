/// <reference path="../sample-data.d.ts"/>
import fs from 'fs';

export var data: readonly SampleRow[] = await fs.promises.readFile('./sample-data.json').then(v => v.toString()).then(JSON.parse);
export default data;