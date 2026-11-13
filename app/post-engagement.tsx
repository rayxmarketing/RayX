import CountUp from './count-up';
import {Data} from '../lib/data';

export default function PostEngagement({data}:{data:Data}) {
 const posts=data.months.flatMap(month=>month.posts);
 const likes=data.allTimePostLikes??posts.reduce((sum,post)=>sum+(post.totalLikes??post.likes??0),0);
 const comments=data.allTimePostComments??posts.reduce((sum,post)=>sum+(post.totalComments??0),0);
 return <section className="post-engagement">
  <h2>Reações nos conteúdos</h2>
  <div className="engagement-totals">
   <div><small>Curtidas</small><strong><CountUp value={likes}/></strong></div>
   <div><small>Comentários</small><strong><CountUp value={comments}/></strong></div>
  </div>
  <small>Soma de todos os posts registrados nas quatro redes desde julho de 2026.</small>
 </section>;
}
