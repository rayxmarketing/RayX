'use client';
import CountUp from './count-up';
import {featuredContents} from '../lib/data';
import {useI18n} from './i18n';

export default function FeaturedContents(){
 const {t,dateLocale}=useI18n();
 return <section className="featured-contents">
  <h2>{t('Conteúdos em destaque')}</h2>
  <p>{t('Resultados totais somados nas quatro redes')}</p>
  <div className="posts">{featuredContents.map(post=><article key={post.title}>
   <small>{post.format} · {new Date(post.date+'T12:00:00').toLocaleDateString(dateLocale)}</small>
   <h3>{post.title}</h3>
   <div className="featured-total"><strong><CountUp value={post.views}/></strong><span>{t('visualizações')}</span></div>
   <div className="featured-reactions">
    <div><strong><CountUp value={post.likes}/></strong><span>{t('curtidas')}</span></div>
    <div><strong><CountUp value={post.comments}/></strong><span>{t('comentários')}</span></div>
   </div>
  </article>)}</div>
 </section>;
}
