'use client';
import {useState} from 'react';
import observations from '../lib/observations.json';
import {fmt,networks} from '../lib/data';

type Observation = {month:string;date:string;values:Record<string,number|null>};
const rows = observations as unknown as Observation[];
const periods=Array.from(new Set(rows.map(row=>row.month))).sort();

export default function Observations({month}:{month:string}) {
 const [period,setPeriod]=useState(periods.includes(month)?month:periods.at(-1)!);
 const current = rows.filter(row=>row.month===period);
 if(!current.length)return null;
 const date = (value:string)=>value.split('-').reverse().join('/');
 return <section className="observations">
  <div className="observations-head"><h2>Registros da planilha</h2><select aria-label="Período dos registros" value={period} onChange={event=>setPeriod(event.target.value)}>
   {periods.toReversed().map(value=><option value={value} key={value}>{new Date(value+'-01T12:00:00').toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</option>)}
  </select></div>
  <p>{date(current[0].date)} a {date(current.at(-1)!.date)} · valores registrados em cada data. A janela de medição segue a informação disponível na planilha.</p>
  {networks.map(network=>{
   const columns=Array.from(new Set(current.flatMap(row=>Object.keys(row.values))))
    .filter(key=>key.startsWith(network+' · '));
   if(!columns.length)return null;
   return <details key={network}>
    <summary>{network}</summary>
    <div className="table-scroll"><table>
     <thead><tr><th>Data</th>{columns.map(key=><th key={key}>{key.split(' · ')[1]}</th>)}</tr></thead>
     <tbody>{current.map(row=><tr key={row.date}>
      <th>{date(row.date)}</th>{columns.map(key=><td key={key}>{fmt(row.values[key])}</td>)}
     </tr>)}</tbody>
    </table></div>
   </details>;
  })}
  <small>As redes começam recolhidas. Campos ausentes permanecem como “Não informado”; valores abreviados em “mil” mantêm a precisão apresentada na origem.</small>
 </section>;
}
