import {test} from 'node:test';import assert from 'node:assert/strict';import {fixtures,total,growth,percent,networks,comparable,canEdit,featuredContents,validate} from '../lib/data';
test('fechamentos e crescimento',()=>{const d=fixtures();assert.equal(total(d.months[2]),48200);assert.equal(growth(d.months[2],d.months[1]),1240);assert.equal(total(d.months[0]),44890);assert.deepEqual(networks,['Facebook','Instagram','YouTube','TikTok']);validate(d)});
test('ausências e períodos incomparáveis',()=>{const d=fixtures();assert.equal(percent(10,0),null);assert.equal(growth(d.months[2],d.months[0]),null);d.months[2].complete=false;assert.equal(growth(d.months[2],d.months[1]),null);d.months[2].competitors[0].followers.Facebook=null;assert.equal(comparable(d.months[2]).length,1)});
test('somente administrador edita',()=>{assert.equal(canEdit('viewer'),false);assert.equal(canEdit(null),false);assert.equal(canEdit('admin'),true)});
test('validação rejeita negativos',()=>{const d=fixtures();d.months[0].metrics.Facebook.followers=-1;assert.throws(()=>validate(d))});
import {importedData} from '../lib/imported';
import observations from '../lib/observations.json';
test('planilha real preserva períodos, totais e concorrentes',()=>{const d=importedData();validate(d);const november=d.months.find(m=>m.month==='2026-11')!;assert.equal(d.months.length,4);assert.equal(total(november),16468);assert.equal(november.complete,false);assert.equal(november.highlight.views,394783);assert.equal(observations.length,169);const latest=observations.find(row=>row.date==='2026-11-16')!;assert.equal(latest.values['TikTok · Views'],91300);assert.equal(latest.values['Instagram · Views'],243800);assert.equal(november.metrics.Facebook.interactions,37110);assert.equal(november.metrics.Instagram.reach,37000);assert.equal(november.posts.reduce((sum,p)=>sum+(p.totalLikes??0),0),120);assert.equal(november.posts.reduce((sum,p)=>sum+(p.totalComments??0),0),12);assert.equal(november.competitors.length,15);const uppertech=november.competitors.find(c=>c.name==='Uppertech')!;assert.deepEqual([uppertech.followers.Instagram,uppertech.followers.Facebook,uppertech.followers.TikTok,uppertech.followers.YouTube,uppertech.total],[64800,0,619,56,65475]);const asx=november.competitors.find(c=>c.name==='ASX')!;assert.deepEqual([asx.followers.Instagram,asx.followers.Facebook,asx.followers.TikTok,asx.followers.YouTube,asx.total,asx.color],[68000,0,0,0,68000,'#F5F5F5']);const code=november.competitors.find(c=>c.name==='Code Automotive')!;assert.deepEqual([code.followers.Instagram,code.followers.Facebook,code.followers.TikTok,code.followers.YouTube,code.total],[7631,679,2262,809,11381])});
test('destaque preserva todas as reações informadas',()=>{const november=importedData().months.find(m=>m.month==='2026-11')!;assert.deepEqual([november.highlight.views,november.highlight.likes,november.highlight.comments,november.highlight.shares],[394783,3485,711,98])});
test('reações históricas incluem todos os posts desde julho',()=>{const data=importedData();assert.deepEqual([data.allTimePostLikes,data.allTimePostComments],[14829,2986])});
test('visualizações históricas somam todos os posts e todas as redes',()=>{const data=importedData();assert.equal(data.allTimePostViews,2068111)});
test('conteúdos em destaque usam somas das quatro redes, sem médias',()=>{assert.deepEqual(featuredContents.map(post=>[post.views,post.likes,post.comments]),[[235714,34,12],[833314,9001,7552],[43284,510,63]])});
import update from '../lib/update-2026-11-16.json';
test('atualização de 16/11 preserva métricas, somas por rede e concorrentes',()=>{
 const data=importedData(),month=data.months.find(m=>m.month==='2026-11')!;
 assert.equal(month.date,'2026-11-16');assert.equal(month.updatedAt,'2026-11-16T12:00:00Z');
 assert.deepEqual(month.metrics,update.metrics);
 assert.deepEqual(observations.find(r=>r.date===month.date),update.observation);
 for(const metric of ['views','likes','comments'] as const) assert.equal(month.highlight[metric],Object.values(update.highlightNetworks).reduce((sum,n)=>sum+n[metric],0));
 assert.equal(data.allTimePostViews,1673328+month.highlight.views!);
 assert.equal(data.allTimePostLikes,11344+month.highlight.likes!);
 assert.equal(data.allTimePostComments,2275+month.highlight.comments!);
 for(const c of month.competitors){assert.equal(c.date,month.date);assert.equal(c.total,Object.values(c.followers).reduce<number>((sum,v)=>sum+(v??0),0));}
 assert.equal(month.competitors.find(c=>c.name==='Somma Films Wintech')!.followers.Facebook,680);
 assert.equal(month.competitors.find(c=>c.name==='Shock Light')!.followers.Facebook,2600);
});
