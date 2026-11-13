import {Data,Metrics} from './data';
export function importedData():Data {
 const metrics=(followers:number):Metrics=>({followers,reach:null,views:null,likes:null,comments:null,shares:null,saves:null});
 return {logo:'',source:'spreadsheet',months:[{month:'2026-11',date:'2026-11-13',complete:false,updatedAt:'2026-11-13T12:00:00Z',metrics:{Facebook:metrics(12855),Instagram:metrics(1447),YouTube:metrics(1391),TikTok:metrics(734)},competitors:[],posts:[],highlight:{src:'/destaque-led.png',type:'image',fit:'cover',url:'',views:392000,title:'Qual o LED ideal para o seu veículo?'}}]};
}

// Preenche somente o destaque vazio da importação, preservando edições locais.
export function refreshImportedHighlight(data:Data):Data {
 if(data.source==='spreadsheet') {
  const month=data.months.find(m=>m.month==='2026-11');
  if(month && !month.highlight.src) month.highlight.src='/destaque-led.png';
 }
 return data;
}
