import {Data,Metrics} from './data';
export function importedData():Data {
 const metrics=(followers:number):Metrics=>({followers,reach:null,views:null,likes:null,comments:null,shares:null,saves:null});
 return {logo:'',source:'spreadsheet',months:[{month:'2026-11',date:'2026-11-13',complete:false,updatedAt:'2026-11-13T12:00:00Z',metrics:{Facebook:metrics(12855),Instagram:metrics(1447),YouTube:metrics(1391),TikTok:metrics(734)},competitors:[],posts:[],highlight:{src:'',type:'image',fit:'cover',url:'',views:392000,title:'Qual o LED ideal para o seu veículo?'}}]};
}
