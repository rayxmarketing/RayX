'use client';
import {useEffect,useState} from 'react';
import CountUp from './count-up';
import {Month,networks,total} from '../lib/data';

export default function Competitors({month}:{month:Month}) {
 const [expanded,setExpanded]=useState(false);
 useEffect(()=>{
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){const timer=setTimeout(()=>setExpanded(true),0);return()=>clearTimeout(timer)}
  let second=0;
  const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>setExpanded(true))});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second)};
 },[month.month]);
 const rows=[
  {name:'RayX',value:total(month),color:'#268CFF'},
  ...month.competitors.map(competitor=>{
   const values=networks.map(network=>competitor.followers[network]);
   return {name:competitor.name,color:competitor.color??'#A6A6A6',value:competitor.total??(values.every(value=>value!==null)
    ? values.reduce<number>((sum,value)=>sum+(value??0),0):null)};
  }),
 ].sort((a,b)=>(b.value??-1)-(a.value??-1));
 const maximum=Math.max(1,...rows.map(row=>row.value??0));
 return <section className="competitors">
  <h2>Concorrentes</h2>
  <div className="bars">{rows.map((row,index)=><div className="bar-row" key={row.name}>
   <span>{row.name}</span><div className="track"><div className="bar competitor-bar" style={{width:expanded?`${(row.value??0)/maximum*100}%`:'0%',backgroundColor:row.color,transitionDelay:`${index*90}ms`,minWidth:expanded&&row.value?4:0}}/></div>
   <strong className={row.value===null?'missing':undefined}>{row.value===null?'Não informado':<CountUp value={row.value}/>}</strong>
  </div>)}</div>
  <small>{month.competitors.some(item=>item.total!=null)?'Totais informados pela RayX':'Valores ainda não informados'} · referência {new Date(month.date+'T12:00:00').toLocaleDateString('pt-BR')}</small>
 </section>;
}
