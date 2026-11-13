'use client';
import {useEffect,useRef} from 'react';
import {fmt} from '../lib/data';

const display=(value:number,decimals:number,prefix:string,suffix:string,locale:string)=>prefix+(decimals?new Intl.NumberFormat(locale,{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value):fmt(value))+suffix;

/** Keeps the final value accessible and reserves its width during animation. */
export default function CountUp({value,celebrate=false,decimals=0,prefix='',suffix='',locale='pt-BR'}:{value:number;celebrate?:boolean|'yellow';decimals?:number;prefix?:string;suffix?:string;locale?:string}) {
 const number=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const element=number.current;
  if(!element)return;
  element.classList.remove('count-up-impact','count-up-impact-yellow');
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const finish=()=>{cancelAnimationFrame(frame);element.textContent=display(value,decimals,prefix,suffix,locale);element.classList.remove('count-up-impact','count-up-impact-yellow')};
  const onPreference=()=>{if(preference.matches)finish()};
  if(preference.matches){finish();return}
  const start=performance.now();
  element.textContent=display(0,decimals,prefix,suffix,locale);
  const tick=(now:number)=>{
   const progress=Math.min(1,(now-start)/1050);
   const eased=1-Math.pow(1-progress,3);
   const animated=decimals?Math.round(value*eased*10**decimals)/10**decimals:Math.round(value*eased);
   element.textContent=display(animated,decimals,prefix,suffix,locale);
   if(progress<1)frame=requestAnimationFrame(tick);
   else if(celebrate){element.classList.add('count-up-impact');if(celebrate==='yellow')element.classList.add('count-up-impact-yellow')}
  };
  frame=requestAnimationFrame(tick);
  preference.addEventListener('change',onPreference);
  return()=>{cancelAnimationFrame(frame);preference.removeEventListener('change',onPreference)};
 },[value,celebrate,decimals,prefix,suffix,locale]);
 const final=display(value,decimals,prefix,suffix,locale);
 return <span className="count-up" aria-label={final}><span className="count-up-space" aria-hidden="true">{final}</span><span className="count-up-number" ref={number} aria-hidden="true">{final}</span></span>;
}
