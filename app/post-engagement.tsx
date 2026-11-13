import CountUp from './count-up';
import {Data} from '../lib/data';
import {useI18n} from './i18n';

export default function PostEngagement({data}:{data:Data}) {
 const {t}=useI18n();
 const posts=data.months.flatMap(month=>month.posts);
 const views=data.allTimePostViews??posts.reduce((sum,post)=>sum+(post.totalViews??post.views??0),0);
 const likes=data.allTimePostLikes??posts.reduce((sum,post)=>sum+(post.totalLikes??post.likes??0),0);
 const comments=data.allTimePostComments??posts.reduce((sum,post)=>sum+(post.totalComments??0),0);
 return <section className="post-engagement">
  <h2>{t('Reações nos conteúdos')}</h2>
  <div className="engagement-totals">
   <div><small>{t('Visualizações')}</small><strong><CountUp value={views} celebrate/></strong></div>
   <div><small>{t('Curtidas')}</small><strong><CountUp value={likes}/></strong></div>
   <div><small>{t('Comentários')}</small><strong><CountUp value={comments}/></strong></div>
  </div>
  <small>{t('Soma de todos os posts registrados nas quatro redes desde julho de 2026.')}</small>
 </section>;
}
