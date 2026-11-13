import CountUp from './count-up';
import {Month,networks,total} from '../lib/data';

export default function Competitors({month}:{month:Month}) {
 const rows=[
  {name:'RayX',value:total(month)},
  ...month.competitors.map(competitor=>{
   const values=networks.map(network=>competitor.followers[network]);
   return {name:competitor.name,value:values.every(value=>value!==null)
    ? values.reduce<number>((sum,value)=>sum+(value??0),0):null};
  }),
 ].sort((a,b)=>(b.value??-1)-(a.value??-1));
 const maximum=Math.max(1,...rows.map(row=>row.value??0));
 return <section className="competitors">
  <h2>Concorrentes</h2>
  <div className="bars">{rows.map(row=><div className="bar-row" key={row.name}>
   <span>{row.name}</span><div className="track"><div className={row.name==='RayX'?'bar blue':'bar'} style={{width:`${(row.value??0)/maximum*100}%`}}/></div>
   <strong className={row.value===null?'missing':undefined}>{row.value===null?'Não informado':<CountUp value={row.value}/>}</strong>
  </div>)}</div>
  <small>Fechamento em {new Date(month.date+'T12:00:00').toLocaleDateString('pt-BR')} · quatro redes · vínculos, não pessoas únicas</small>
 </section>;
}
