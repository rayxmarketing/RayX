'use client';
import {useEffect,useState} from 'react';
import CountUp from './count-up';
import {Month,Network,networks,total} from '../lib/data';
import {useI18n} from './i18n';
import {ArrowDown,ArrowUp,Minus} from 'lucide-react';

type Movement='up'|'down'|'same';
type RankMemory=Record<string,Record<string,{current:number;previous:number}>>;

export default function Competitors({month,metric}:{month:Month;metric:'total'|Network}) {
 const {t,dateLocale}=useI18n();
 const [expanded,setExpanded]=useState(false);
 const [selected,setSelected]=useState<string|null>(null);
 const [movements,setMovements]=useState<Record<string,Movement>>({});
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
 const validRows=allRows.filter(row=>row.value!==null);
 const rankedRows=allRows.map(row=>({...row,rank:validRows.findIndex(item=>item.name===row.name)+1||null}));
 const rankSignature=validRows.map((row,index)=>`${row.name}:${index+1}`).join('|');
 useEffect(()=>{
  const ranking=rankSignature.split('|').filter(Boolean).map(item=>{const separator=item.lastIndexOf(':');return {name:item.slice(0,separator),rank:Number(item.slice(separator+1))}});
  if(ranking.length<2)return;
  const timer=setTimeout(()=>{
   const key='rayx-competitor-ranks-v1';
   let memory:RankMemory={};
   try{memory=JSON.parse(localStorage.getItem(key)??'{}') as RankMemory}catch{memory={}}
   const scope=memory[metric]??{},next={...scope},movement:Record<string,Movement>={};
   ranking.forEach(({name,rank})=>{const stored=scope[name];if(!stored)next[name]={current:rank,previous:rank};else if(stored.current!==rank)next[name]={current:rank,previous:stored.current};movement[name]=!stored||next[name].current===next[name].previous?'same':next[name].current<next[name].previous?'up':'down'});
   memory[metric]=next;localStorage.setItem(key,JSON.stringify(memory));setMovements(movement);
  },0);
  return()=>clearTimeout(timer);
 },[metric,rankSignature]);
 const rows=selected?rankedRows.filter(row=>row.name==='RayX'||row.name===selected):rankedRows;
 const maximum=Math.max(1,...rows.map(row=>row.value??0));
 const selectedRow=selected?rankedRows.find(row=>row.name===selected):undefined;
 const rayxRow=rankedRows.find(row=>row.name==='RayX')!;
 const gap=selectedRow?.value!=null&&rayxRow.value!=null?rayxRow.value-selectedRow.value:null;
 const percentage=gap!=null&&selectedRow?.value?gap/selectedRow.value*100:null;
 const MovementIcon=({name}:{name:string})=>{const movement=movements[name]??'same';const Icon=movement==='up'?ArrowUp:movement==='down'?ArrowDown:Minus;return <Icon className={`rank-movement ${movement}`} size={16} aria-label={t(movement==='up'?'Subiu no ranking':movement==='down'?'Desceu no ranking':'Manteve a posição')}/>};
 return <section className="competitors">
  <h2>{t('Concorrentes')} <span>· {metric==='total'?t('Total'):metric}</span></h2>
  <div className="bars">{rows.map((row,index)=><div className={`bar-row${selected===row.name?' selected-competitor':''}${row.name==='RayX'?' rayx-row':''}`} key={row.name}>
   <div className="competitor-identity">{row.rank&&<span className="rank-position">{row.rank}º</span>}<MovementIcon name={row.name}/><button type="button" aria-pressed={selected===row.name} aria-label={row.name==='RayX'?t('Mostrar todos os concorrentes'):`${t('Comparar RayX com')} ${row.name}`} onClick={()=>setSelected(row.name==='RayX'?null:row.name)} className={`competitor-name${row.name==='RayX'?' rayx-competitor-name':''}`}>{row.name}</button></div><div className="track"><div className="bar competitor-bar" style={{width:expanded?`${(row.value??0)/maximum*100}%`:'0%',backgroundColor:row.color,transitionDelay:`${index*135}ms`,minWidth:expanded&&row.value?4:0}}/></div>
   <strong className={row.value===null?'missing':undefined}>{row.value===null?t('Não informado'):<CountUp value={row.value}/>}</strong>
  </div>)}</div>
  {selectedRow&&gap!=null&&<div className="comparison-insights">
   <div><small>{t('Diferença atual')}</small><strong>{new Intl.NumberFormat(dateLocale,{signDisplay:'always'}).format(gap)}</strong><span>{gap>=0?t('RayX à frente'):t('RayX atrás')}</span></div>
   <div><small>{t('Diferença percentual')}</small><strong>{percentage==null?'—':new Intl.NumberFormat(dateLocale,{signDisplay:'always',minimumFractionDigits:1,maximumFractionDigits:1}).format(percentage)+'%'}</strong><span>{t('em relação ao concorrente')}</span></div>
  </div>}
  <small>{t(metric==='total'?'Total das quatro redes':'Seguidores / inscritos por rede')} · {t('referência')} {new Date(month.date+'T12:00:00').toLocaleDateString(dateLocale)} · {t('Clique em um concorrente para comparar')}</small>
 </section>;
}
