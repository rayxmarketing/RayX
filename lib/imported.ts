import imported from './imported-data.json';
import previousUpdate from './update-2026-11-16.json';
import previousPosts from './update-posts-2026-11-17.json';
import novemberUpdate from './update-2026-11-18.json';
import latestUpdate from './update-2026-11-20.json';
import competitorUpdate from './competitors-2026-11-23.json';
import {Data,Metrics,Network,Post,networks} from './data';
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

type NetworkMetrics = Partial<Record<Network, Partial<Metrics>>>;
const publishedNovember18Metrics: NetworkMetrics = {
 ...previousUpdate.metrics,
 Instagram: {followers:1472, views:249800, reach:37600, interactions:8100, visits:6900},
 TikTok: {followers:746, views:92300, profileViews:1200, interactions:1376, likes:1660},
 YouTube: {followers:1395, views:333425, watchTime48h:376, watchTime:4600},
};

function mergeNovemberMetrics(month:Data['months'][number], incoming:NetworkMetrics, ...baselines:NetworkMetrics[]){
 for(const [network,metrics] of Object.entries(incoming)){
  const name=network as Network;
  for(const [key,value] of Object.entries(metrics)){
   const field=key as keyof Metrics;
   if(!baselines.some(baseline=>month.metrics[name][field]===baseline[name]?.[field])) continue;
   if(field==='followers'){
    if(typeof value==='number') month.metrics[name].followers=value;
   }else{
    month.metrics[name][field]=value;
   }
  }
 }
}

function appendMissingPost(month:Data['months'][number], post:Post){
 const existing=month.posts.some(item=>item.id===post.id ||
  (item.date===post.date && normalizeTitle(item.title)===normalizeTitle(post.title)));
 if(!existing) month.posts.push(structuredClone(post));
}

// Merge only fields that still match the published baseline. The read does not
// write to browser storage or Supabase. An explicit admin save retains the merge.
export function refreshNovemberUpdate(data:Data):Data {
 const refreshed=refreshNovemberMetricsAndPosts(data);
 const month=refreshed.months.find(item=>item.month==='2026-11');
 if(!month) return refreshed;

 let changed=false;
 const competitors=month.competitors.map(competitor=>{
  const baseline=novemberUpdate.competitors.find(item=>item.name===competitor.name);
  const incoming=competitorUpdate.competitors.find(item=>item.name===competitor.name);
  if(!baseline || !incoming || competitor.date!==baseline.date) return competitor;
  if(!networks.every(network=>competitor.followers[network]===baseline.followers[network])) return competitor;
  if(competitor.total!=null && competitor.total!==baseline.total) return competitor;

  changed=true;
  return {...competitor,date:incoming.date,followers:{...incoming.followers},total:incoming.total,followerDates:undefined};
 });
 return changed ? {...refreshed,months:refreshed.months.map(item=>item===month ? {...item,competitors} : item)} : refreshed;
}

function refreshNovemberMetricsAndPosts(data:Data):Data {
 const month=data.months.find(item=>item.month==='2026-11');
 if(!month || (month.date!==previousUpdate.referenceDate && month.date!==novemberUpdate.referenceDate)) return data;

 data=structuredClone(data);
 const november=data.months.find(item=>item.month===month.month)!;
 if(month.date===previousUpdate.referenceDate){
  applyNovember18(data,november);
 }
 november.date=latestUpdate.referenceDate;
 const updatedAt=latestUpdate.referenceDate+'T12:00:00Z';
 if(november.updatedAt<updatedAt) november.updatedAt=updatedAt;
 mergeNovemberMetrics(november,latestUpdate.metrics,publishedNovember18Metrics,novemberUpdate.metrics);
 for(const post of latestUpdate.posts) appendMissingPost(november,post as Post);
 for(const [key,field] of Object.entries({allTimePostViews:'totalViews',allTimePostLikes:'totalLikes',allTimePostComments:'totalComments'} as const)){
  const historicalKey=key as keyof typeof postContributions;
  const baseline=previousPosts.historical[historicalKey]+postContributions[historicalKey];
  if(data[historicalKey]===baseline) data[historicalKey]=baseline+latestUpdate.posts.reduce((sum,post)=>sum+post[field],0);
 }
 return data;
}

function applyNovember18(data:Data, november:Data['months'][number]){
 mergeNovemberMetrics(november,novemberUpdate.metrics,previousUpdate.metrics);

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

 const historicalKeys=Object.keys(postContributions) as (keyof typeof postContributions)[];
 const olderSpreadsheet=data.source==='spreadsheet' &&
  historicalKeys.every(key=>data[key]===previousUpdate.historical[key]);
 if(olderSpreadsheet) previousPosts.posts.forEach(post=>appendMissingPost(november,post as Post));
 appendMissingPost(november,novemberUpdate.post as Post);
 for(const key of historicalKeys){
  const baseline=previousPosts.historical[key];
  if(olderSpreadsheet || data[key]===baseline) data[key]=baseline+postContributions[key];
 }
}
