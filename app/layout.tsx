import './style.css';
import {LanguageProvider} from './i18n';
export const metadata={title:'RayX · Redes sociais',description:'Resultados que movem a RayX',icons:{icon:'/icon.png',apple:'/icon.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><LanguageProvider>{children}</LanguageProvider></body></html>}
