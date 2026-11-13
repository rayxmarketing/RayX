import observations from '../lib/observations.json';
import {Data,fmt,Month} from '../lib/data';

export default function GrowthComparison({month,delta,source}:{month:Month;delta:number|null;source:Data['source']}) {
 if(source==='spreadsheet') {
  const first=observations.find(row=>row.values['Instagram · Seguidores']!=null);
  const initial=first?.values['Instagram · Seguidores'];
  if(initial&&initial>0) {
   const percentage=(month.metrics.Instagram.followers-initial)/initial*100;
   const formatted=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(percentage);
   const date=first!.date.slice(8,10)+'/'+first!.date.slice(5,7);
   return <div className="growth"><b>{percentage>=0?'+':''}{formatted}%</b><span> Instagram desde {date}</span></div>;
  }
 }
 return <div className="growth"><b>{delta===null?'—':`${delta>=0?'+':''}${fmt(delta)}`}</b><span>{delta===null?' sem comparação mensal':' no mês'}</span></div>;
}
