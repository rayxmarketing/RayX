'use client';
import {useEffect,useState} from 'react';
import CountUp from './count-up';
import {Month,Network,networks,total} from '../lib/data';
import {useI18n} from './i18n';

export default function Competitors({month,metric}:{month:Month;metric:'total'|Network}) {
 const {t,dateLocale}=useI18n();
 const [expanded,setExpanded]=useState(false);
 const [selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){const timer=setTimeout(()=>setExpanded(true),0);return()=>clearTimeout(timer)}
  let second=0;
  const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setExpanded(true))});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second)};
 },[month.month,metric]);
 const allRows=[
  {name:'RayX',value:metric==='total'?total(month):month.metrics[metric].followers,color:'#268CFF'},
  ...month.competitors.map(competitor=>{
   const values=networks.map(network=>competitor.followers[network]);
   const value=metric==='total'?(competitor.total??(values.every(value=>value!==null)
    ? values.reduce<number>((sum,item)=>sum+(item??0),0):null)):competitor.followers[metric];
   return {name:competitor.name,color:competitor.color??'#A6A6A6',value};
  }),
 ].sort((a,b)=>(b.value??-1)-(a.value??-1));
 const rows=selected?allRows.filter(row=>row.name==='RayX'||row.name===selected):allRows;
 const maximum=Math.max(1,...rows.map(row=>row.value??0));
 return <section className="competitors">
  <h2>{t('Concorrentes')} <span>· {metric==='total'?t('Total'):metric}</span></h2>
  <div className="bars">{rows.map((row,index)=><div className={`bar-row${selected===row.name?' selected-competitor':''}${row.name==='RayX'?' rayx-row':''}`} key={row.name}>
   <button type="button" aria-pressed={selected===row.name} aria-label={row.name==='RayX'?t('Mostrar todos os concorrentes'):`${t('Comparar RayX com')} ${row.name}`} onClick={()=>setSelected(row.name==='RayX'?null:row.name)} className={`competitor-name${row.name==='RayX'?' rayx-competitor-name':''}`}>{row.name}</button><div className="track"><div className="bar competitor-bar" style={{width:expanded?`${(row.value??0)/maximum*100}%`:'0%',backgroundColor:row.color,transitionDelay:`${index*135}ms`,minWidth:expanded&&row.value?4:0}}/></div>
   <strong className={row.value===null?'missing':undefined}>{row.value===null?t('Não informado'):<CountUp value={row.value}/>}</strong>
  </div>)}</div>
  <small>{t(metric==='total'?'Total das quatro redes':'Seguidores / inscritos por rede')} · {t('referência')} {new Date(month.date+'T12:00:00').toLocaleDateString(dateLocale)} · {t('Clique em um concorrente para comparar')}</small>
 </section>;
}
