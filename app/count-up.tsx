'use client';
import {useEffect,useRef} from 'react';
import {fmt} from '../lib/data';

/** Keeps the final value accessible and reserves its width during animation. */
export default function CountUp({value,celebrate=false}:{value:number;celebrate?:boolean}) {
 const number=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const element=number.current;
  if(!element)return;
  element.classList.remove('count-up-impact');
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const finish=()=>{cancelAnimationFrame(frame);element.textContent=fmt(value);element.classList.remove('count-up-impact')};
  const onPreference=()=>{if(preference.matches)finish()};
  if(preference.matches){finish();return}
  const start=performance.now();
  element.textContent=fmt(0);
  const tick=(now:number)=>{
   const progress=Math.min(1,(now-start)/1050);
   const eased=1-Math.pow(1-progress,3);
   element.textContent=fmt(Math.round(value*eased));
   if(progress<1)frame=requestAnimationFrame(tick);
   else if(celebrate)element.classList.add('count-up-impact');
  };
  frame=requestAnimationFrame(tick);
  preference.addEventListener('change',onPreference);
  return()=>{cancelAnimationFrame(frame);preference.removeEventListener('change',onPreference)};
 },[value,celebrate]);
 return <span className="count-up" aria-label={fmt(value)}><span className="count-up-space" aria-hidden="true">{fmt(value)}</span><span className="count-up-number" ref={number} aria-hidden="true">{fmt(value)}</span></span>;
}
