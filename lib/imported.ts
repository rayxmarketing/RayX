import imported from './imported-data.json';
import previousUpdate from './update-2026-11-16.json';
import previousPosts from './update-posts-2026-11-17.json';
import novemberUpdate from './update-2026-11-18.json';
import {Data,Metrics,Network,Post} from './data';
export function importedData():Data {
 return structuredClone(imported) as Data;
}

// Preenche somente o destaque vazio da importação, preservando edições locais.
export function refreshImportedHighlight(data:Data):Data {
 if(data.source==='spreadsheet') {
  if(!data.logo) data.logo='/rayx-logo.png';
  const month=data.months.find(m=>m.month==='2026-11');
  if(month && !month.highlight.src) month.highlight.src='/destaque-led.png';
 }
 return data;
}


const normalizeTitle=(title:string)=>title.normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const postContributions={
 allTimePostViews: novemberUpdate.post.totalViews,
 allTimePostLikes: novemberUpdate.post.totalLikes,
 allTimePostComments: novemberUpdate.post.totalComments,
};

// Merge only fields that still match the published baseline. The read does not
// write to browser storage or Supabase. An explicit admin save retains the merge.
export function refreshNovemberUpdate(data:Data):Data {
 const month=data.months.find(item=>item.month==='2026-11');
 if(!month || month.date!==previousUpdate.referenceDate) return data;

 data=structuredClone(data);
 const november=data.months.find(item=>item.month===month.month)!;
 november.date=novemberUpdate.referenceDate;
 const updatedAt=novemberUpdate.referenceDate+'T12:00:00Z';
 if(november.updatedAt<updatedAt) november.updatedAt=updatedAt;

 for(const [network,metrics] of Object.entries(novemberUpdate.metrics)){
  const name=network as Network;
  const original:Metrics=previousUpdate.metrics[name];
  for(const [key,value] of Object.entries(metrics)){
   const field=key as keyof Metrics;
   if(november.metrics[name][field]===original[field]) november.metrics[name][field]=value;
  }
 }

 for(const competitor of november.competitors){
  const original=previousUpdate.competitors.find(item=>item.name===competitor.name);
  const incoming=novemberUpdate.competitors.find(item=>item.name===competitor.name);
  if(!original || !incoming || competitor.date!==original.date) continue;
  // A manually edited observation keeps its own values and reference date.
  const unchanged=Object.keys(original.followers).every(key=>{
   const network=key as Network;
   return competitor.followers[network]===original.followers[network];
  });
  if(!unchanged || (competitor.total!=null && competitor.total!==original.total)) continue;
  Object.assign(competitor,{date:incoming.date,total:incoming.total,followerDates:{...competitor.followerDates,...incoming.followerDates},followers:{...incoming.followers}});
 }

 const appendMissingPost=(post:Post)=>{
  const existing=november.posts.some(item=>item.id===post.id ||
   (item.date===post.date && normalizeTitle(item.title)===normalizeTitle(post.title)));
  if(!existing) november.posts.push(structuredClone(post));
 };
 const historicalKeys=Object.keys(postContributions) as (keyof typeof postContributions)[];
 const olderSpreadsheet=data.source==='spreadsheet' &&
  historicalKeys.every(key=>data[key]===previousUpdate.historical[key]);
 if(olderSpreadsheet) previousPosts.posts.forEach(post=>appendMissingPost(post as Post));
 appendMissingPost(novemberUpdate.post as Post);
 for(const key of historicalKeys){
  const baseline=previousPosts.historical[key];
  if(olderSpreadsheet || data[key]===baseline) data[key]=baseline+postContributions[key];
 }
 return data;
}
