import imported from './imported-data.json';
import {Data} from './data';
export function importedData():Data {
 return structuredClone(imported) as Data;
}

// Preenche somente o destaque vazio da importação, preservando edições locais.
export function refreshImportedHighlight(data:Data):Data {
 if(data.source==='spreadsheet') {
  if(!data.logo) data.logo='/rayx-logo.png';
  const month=data.months.find(m=>m.month==='2026-11');
  if(month && !month.highlight.src) month.highlight.src='/destaque-led.png';
 }
 return data;
}
