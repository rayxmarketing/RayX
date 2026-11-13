import observations from '../lib/observations.json';
import {Data,fmt,Month} from '../lib/data';
import {useI18n} from './i18n';
import CountUp from './count-up';

export default function GrowthComparison({month,delta,source}:{month:Month;delta:number|null;source:Data['source']}) {
 const {t,dateLocale}=useI18n();
 if(source==='spreadsheet') {
  const first=observations.find(row=>row.values['Instagram · Seguidores']!=null);
  const initial=first?.values['Instagram · Seguidores'];
  if(initial&&initial>0) {
   const percentage=(month.metrics.Instagram.followers-initial)/initial*100;
   return <div className="growth"><b><CountUp value={percentage} decimals={1} prefix={percentage>=0?'+':''} suffix="%" locale={dateLocale}/></b></div>;
  }
 }
 return <div className="growth"><b>{delta===null?'—':`${delta>=0?'+':''}${fmt(delta)}`}</b><span>{t(delta===null?' sem comparação mensal':' no mês')}</span></div>;
}
