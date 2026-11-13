'use client';
import {createContext,useContext,useEffect,useState} from 'react';

export type Locale='pt-BR'|'zh-CN';

const translations:Record<string,string>={
 'Mês de referência':'参考月份','Resultados RayX':'RayX 数据报告','Dados ilustrativos · demonstração':'演示数据','Tela cheia':'全屏','Sair':'退出',
 'Tentar novamente':'重试','Carregando resultados…':'正在加载数据…','Seus resultados começam aqui.':'您的数据报告从这里开始。','Nenhum mês cadastrado. Um administrador pode adicionar o primeiro período.':'尚未添加月份。管理员可以添加第一个统计周期。',
 'Redes sociais':'社交媒体','Seguidores + inscritos':'粉丝与订阅者','Destaque do mês':'本月亮点','visualizações':'次观看','curtidas':'点赞','comentários':'评论','compartilhamentos':'分享','Ver publicação':'查看帖子',
 'UMA VISÃO AO LONGO DO TEMPO':'长期趋势一览','Evolução mensal':'月度趋势','meses':'个月','parcial':'部分数据','Conteúdos em destaque':'热门内容','Os três mais vistos do período':'本期观看量最高的三个内容','Resultados totais somados nas quatro redes':'四个平台数据相加后的总计','Ver conteúdo':'查看内容',
 'Concorrentes':'竞争对手','Total':'总计','Não informado':'暂无数据','Total das quatro redes':'四个平台总计','Seguidores / inscritos por rede':'各平台粉丝/订阅者','referência':'截至',
 'Reações nos conteúdos':'内容互动','Curtidas':'点赞','Comentários':'评论','Soma de todos os posts registrados nas quatro redes desde julho de 2026.':'自2026年7月以来四个平台全部已记录帖子的总和。',
 'Registros da planilha':'表格记录','Período dos registros':'记录周期','Data':'日期','As redes começam recolhidas. Campos ausentes permanecem como “Não informado”; valores abreviados em “mil” mantêm a precisão apresentada na origem.':'各平台默认收起。缺失字段显示为“暂无数据”；以“千”缩写的数值保留源数据精度。',
 'Mídia indisponível':'媒体不可用','Mídia RayX':'RayX 媒体','Dados fornecidos pela RayX':'数据由 RayX 提供','Todos os dados são fictícios':'所有数据均为虚构','Dados da organização':'机构数据','Atualizado em':'更新于',
 ' sem comparação mensal':' 暂无月度对比',' no mês':' 本月','Planilha':'表格','Dados ilustrativos':'演示数据','demonstração':'演示','Resultados que movem a RayX':'推动 RayX 前进的数据成果'
};

type I18nValue={locale:Locale;setLocale:(locale:Locale)=>void;t:(text:string)=>string;dateLocale:string};
const I18nContext=createContext<I18nValue>({locale:'pt-BR',setLocale:()=>{},t:text=>text,dateLocale:'pt-BR'});

export function LanguageProvider({children}:{children:React.ReactNode}){
 const [locale,setLocaleState]=useState<Locale>('pt-BR');
 useEffect(()=>{const saved=localStorage.getItem('rayx-language');if(saved==='zh-CN'){const timer=setTimeout(()=>{setLocaleState('zh-CN');document.documentElement.lang='zh-CN';document.title='RayX · 社交媒体'},0);return()=>clearTimeout(timer)}},[]);
 const setLocale=(value:Locale)=>{setLocaleState(value);localStorage.setItem('rayx-language',value);document.documentElement.lang=value;document.title=value==='zh-CN'?'RayX · 社交媒体':'RayX · Redes sociais'};
 const t=(text:string)=>locale==='zh-CN'?(translations[text]??text):text;
 return <I18nContext.Provider value={{locale,setLocale,t,dateLocale:locale}}>{children}</I18nContext.Provider>;
}
export const useI18n=()=>useContext(I18nContext);
