import {test} from 'node:test';import assert from 'node:assert/strict';import {fixtures,total,growth,percent,networks,comparable,canEdit,featuredContents,validate} from '../lib/data';
test('fechamentos e crescimento',()=>{const d=fixtures();assert.equal(total(d.months[2]),48200);assert.equal(growth(d.months[2],d.months[1]),1240);assert.equal(total(d.months[0]),44890);assert.deepEqual(networks,['Facebook','Instagram','YouTube','TikTok']);validate(d)});
test('ausências e períodos incomparáveis',()=>{const d=fixtures();assert.equal(percent(10,0),null);assert.equal(growth(d.months[2],d.months[0]),null);d.months[2].complete=false;assert.equal(growth(d.months[2],d.months[1]),null);d.months[2].competitors[0].followers.Facebook=null;assert.equal(comparable(d.months[2]).length,1)});
test('somente administrador edita',()=>{assert.equal(canEdit('viewer'),false);assert.equal(canEdit(null),false);assert.equal(canEdit('admin'),true)});
test('validação rejeita negativos',()=>{const d=fixtures();d.months[0].metrics.Facebook.followers=-1;assert.throws(()=>validate(d))});
import {importedData,refreshNovemberUpdate} from '../lib/imported';
import observations from '../lib/observations.json';
test('planilha real preserva períodos, totais e concorrentes',()=>{const d=importedData();validate(d);const november=d.months.find(m=>m.month==='2026-11')!;assert.equal(d.months.length,4);assert.equal(total(november),14531);assert.equal(november.metrics.Instagram.followers,1481);assert.equal(november.complete,false);assert.equal(november.highlight.views,394783);assert.equal(observations.length,169);const latest=observations.find(row=>row.date==='2026-11-16')!;assert.equal(latest.values['TikTok · Views'],91300);assert.equal(latest.values['Instagram · Views'],243800);assert.equal(november.metrics.Facebook.interactions,37472);assert.equal(november.metrics.Instagram.reach,37300);assert.equal(november.posts.reduce((sum,p)=>sum+(p.totalLikes??0),0),3805);assert.equal(november.posts.reduce((sum,p)=>sum+(p.totalComments??0),0),768);assert.equal(november.competitors.length,15);const uppertech=november.competitors.find(c=>c.name==='Uppertech')!;assert.deepEqual([uppertech.followers.Instagram,uppertech.followers.Facebook,uppertech.followers.TikTok,uppertech.followers.YouTube,uppertech.total],[65000,0,619,57,65676]);const asx=november.competitors.find(c=>c.name==='ASX')!;assert.deepEqual([asx.followers.Instagram,asx.followers.Facebook,asx.followers.TikTok,asx.followers.YouTube,asx.total,asx.color],[68000,0,0,0,68000,'#F5F5F5']);const code=november.competitors.find(c=>c.name==='Code Automotive')!;assert.deepEqual([code.followers.Instagram,code.followers.Facebook,code.followers.TikTok,code.followers.YouTube,code.total],[7630,679,2260,810,11379])});
test('destaque preserva todas as reações informadas',()=>{const november=importedData().months.find(m=>m.month==='2026-11')!;assert.deepEqual([november.highlight.views,november.highlight.likes,november.highlight.comments,november.highlight.shares],[394783,3485,711,98])});
test('reações históricas incluem todos os posts desde julho',()=>{const data=importedData();assert.deepEqual([data.allTimePostLikes,data.allTimePostComments],[15029,3031])});
test('visualizações históricas somam todos os posts e todas as redes',()=>{const data=importedData();assert.equal(data.allTimePostViews,2083912)});
test('conteúdos em destaque usam somas das quatro redes, sem médias',()=>{assert.deepEqual(featuredContents.map(post=>[post.views,post.likes,post.comments]),[[235714,34,12],[833314,9001,7552],[43284,510,63]])});
import update from '../lib/update-2026-11-16.json';
import update18 from '../lib/update-2026-11-18.json';
import update20 from '../lib/update-2026-11-20.json';
import update25 from '../lib/update-2026-11-25.json';
import collected24 from '../lib/competitors-2026-11-24.json';
import competitors24 from '../lib/competitors-2026-11-24-restored.json';
import posts17 from '../lib/update-posts-2026-11-17.json';
test('atualização de 25/11 aplica as medições e preserva o destaque',()=>{
 const data=importedData(),month=data.months.find(m=>m.month==='2026-11')!;
 assert.equal(month.date,'2026-11-25');assert.equal(month.updatedAt,'2026-11-25T12:00:00Z');
 assert.equal(month.metrics.Facebook.followers,10896);
 assert.equal(month.metrics.Facebook.views,1730932);
 assert.equal(month.metrics.Facebook.interactions,37472);
 for(const network of ['Instagram','TikTok','YouTube'] as const){
  assert.deepEqual(month.metrics[network],{...update.metrics[network],...update25.metrics[network]});
 }
 assert.deepEqual(observations.find(r=>r.date===update.referenceDate),update.observation);
 for(const expected of [...update18.observations,...update20.observations]){
  const row=observations.find(r=>r.date===expected.date)!;
  assert.equal(row.values['Facebook · Seguidores'],null);
  for(const [key,value] of Object.entries(expected.values)) assert.equal(row.values[key as keyof typeof row.values],value);
 }
 for(const expected of update25.observations){
  assert.deepEqual(observations.find(row=>row.date===expected.date),expected);
 }
 for(const metric of ['views','likes','comments'] as const) assert.equal(month.highlight[metric],Object.values(update.highlightNetworks).reduce((sum,n)=>sum+n[metric],0));
 assert.equal(data.allTimePostViews,1673328+month.highlight.views!+2158+2935+8111+2597);
 assert.equal(data.allTimePostLikes,11344+month.highlight.likes!+19+41+116+24);
 assert.equal(data.allTimePostComments,2275+month.highlight.comments!+8+7+29+1);
 assert.deepEqual(month.competitors,competitors24.competitors);
 for(const c of month.competitors){assert.equal(c.date,competitors24.referenceDate);assert.equal(c.total,Object.values(c.followers).includes(null)?null:Object.values(c.followers).reduce<number>((sum,v)=>sum+(v??0),0));}
 assert.equal(month.competitors.find(c=>c.name==='Somma Films Wintech')!.followers.Facebook,679);
 assert.equal(month.competitors.find(c=>c.name==='Shock Light')!.followers.Facebook,2668);
});

test('planilha soma as redes dos nove posts sem duplicar o destaque',()=>{
 const data=importedData(),posts=data.months.find(m=>m.month==='2026-11')!.posts;
 assert.equal(posts.length,9);
 assert.equal(new Set(posts.map(p=>p.id)).size,9);
 assert.deepEqual(posts.map(p=>[p.totalViews,p.totalLikes,p.totalComments]),[
  [4849,51,4],[310,11,0],[953,20,0],[2562,38,8],[394783,3485,711],[2158,19,8],[2935,41,7],[8111,116,29],[2597,24,1]
 ]);
 const blackFriday=posts.find(p=>p.title==='Black Friday Small')!;
 assert.equal(blackFriday.date,'2026-11-10');
 assert.equal(blackFriday.views,1649);assert.equal(blackFriday.likes,2);
 assert.equal(data.allTimePostViews,2068111+509+1649+2935+8111+2597);
 assert.equal(data.allTimePostLikes,14829+17+2+41+116+24);
 assert.equal(data.allTimePostComments,2986+0+8+7+29+1);
});

test('atualiza dados salvos sem sobrescrever edições nem duplicar o post',()=>{
 const saved=importedData();
 const month=saved.months.at(-1)!;
 Object.assign(saved,posts17.historical,{logo:'/meu-logo.png'});
 month.date=update.referenceDate;
 month.metrics=structuredClone(update.metrics);
 month.metrics.Instagram.views=123456;
 month.highlight.src='/meu-destaque.png';
 month.competitors=structuredClone(update.competitors);
 month.competitors[0].profile='meu perfil';
 month.competitors[1].followers.Facebook=3333;
 month.posts[6].id='id-personalizado';
 month.posts[6].media='/minha-miniatura.png';
 const result=refreshNovemberUpdate(saved);
 const november=result.months.at(-1)!;
 assert.equal(november.metrics.Instagram.followers,1481);
 assert.equal(november.metrics.Instagram.views,123456);
 assert.equal(november.competitors[0].followers.TikTok,619);
 assert.equal(november.competitors[0].date,competitors24.referenceDate);
 assert.equal(november.competitors[0].followerDates?.TikTok,'2026-11-23');
 assert.equal(november.competitors[0].profile,'meu perfil');
 assert.deepEqual(november.competitors[1],month.competitors[1]);
 assert.equal(november.posts.length,9);
 assert.equal(november.posts[6].media,'/minha-miniatura.png');
 assert.equal(november.highlight.src,'/meu-destaque.png');
 assert.equal(result.logo,'/meu-logo.png');
 assert.equal(result.allTimePostViews,2083912);
 assert.equal(saved.allTimePostViews,2070269);
 assert.deepEqual(refreshNovemberUpdate(result),result);
});

test('atualiza dados publicados em 18/11 e preserva ajustes e seguidores do Facebook',()=>{
 const saved=importedData();
 const month=saved.months.at(-1)!;
 month.date='2026-11-18';
 month.posts.splice(7);
 month.metrics.Facebook.followers=12999;
 month.metrics.Instagram.followers=1472;
 month.metrics.Instagram.views=123456;
 month.metrics.TikTok.likes=1660;
 month.metrics.YouTube.watchTime48h=376;

 const result=refreshNovemberUpdate(saved);
 const november=result.months.at(-1)!;
 assert.equal(november.metrics.Instagram.followers,1481);
 assert.equal(november.metrics.Instagram.views,123456);
 assert.equal(november.metrics.Facebook.followers,12999);
 assert.equal(november.posts.length,9);
 assert.equal(november.metrics.TikTok.likes,1687);
 assert.equal(november.metrics.YouTube.watchTime48h,284);
 assert.equal(month.metrics.Instagram.followers,1472);
 assert.deepEqual(refreshNovemberUpdate(result),result);
});

test('atualiza concorrentes em dados já publicados e mantém contagens indisponíveis',()=>{
 const saved=importedData();
 const month=saved.months.at(-1)!;
 month.competitors=structuredClone(collected24.competitors);
 month.competitors[0].profile='perfil personalizado';
 month.competitors[1].followers.Facebook=3333;

 const result=refreshNovemberUpdate(saved);
 const november=result.months.at(-1)!;
 assert.equal(november.date,month.date);
 assert.deepEqual(november.metrics,month.metrics);
 assert.equal(november.competitors[0].profile,'perfil personalizado');
 assert.deepEqual(november.competitors[1],month.competitors[1]);
 const cinoy=november.competitors.find(item=>item.name==='Cinoy')!;
 const shockLight=november.competitors.find(item=>item.name==='Shock Light')!;
 assert.deepEqual([cinoy.followers.Facebook,cinoy.total,shockLight.followers.TikTok,shockLight.total],[null,null,11,24939]);
 assert.equal(month.competitors[0].date,collected24.referenceDate);
 assert.deepEqual(refreshNovemberUpdate(result),result);
});
