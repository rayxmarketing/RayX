# RayX Social

Painel responsivo em Next.js / TypeScript, com apresentação e administração em `/admin`.

## Executar
Node.js 22 ou superior. `npm ci`, `npm run dev`. Validação: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. Produção: `npm start`.

Sem variáveis externas funciona em demonstração: dados fictícios de setembro a novembro de 2026, seis posts por mês, edição persistida no navegador. Limpar os dados do site restaura as fixtures. Upload local está sujeito à quota do navegador; falhas são exibidas e não confirmadas como salvas.

## Supabase / modo online
1. Crie um projeto Supabase e execute `supabase/schema.sql` uma vez no SQL Editor.
2. Desabilite cadastro público em Authentication. Crie usuários no painel Authentication > Users.
3. No SQL Editor, atribua a conta inicial: `insert into public.profiles(id,role) values ('UUID-DO-USUARIO','admin');`. Para visualizadores use `viewer`.
4. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local` e na Vercel. Use a URL e chave pública do projeto; nunca uma chave service_role.
5. Reinicie/republique. Faça login e cadastre o primeiro mês. O banco online começa vazio e nunca recebe fixtures automaticamente.

A autorização ocorre no PostgreSQL via RLS, inclusive no bucket privado de mídia. Usuários não podem editar os próprios papéis. Apenas membros leem dados e arquivos; apenas administradores escrevem. URLs assinadas de arquivos expiram após uma hora; recarregue para renovar. A interface usa o SDK oficial diretamente com a chave pública. Nenhuma credencial privilegiada é necessária no frontend.

O documento mensal é salvo integralmente; em edição simultânea prevalece o último salvamento. A validação de formulário não substitui RLS. Testes de integração das políticas exigem um projeto configurado e contas admin/viewer; os testes locais cobrem cálculos e a decisão de acesso da interface.

## GitHub e Vercel
Envie a branch `main` ao GitHub. Importe o repositório na Vercel, preset Next.js e diretório raiz padrão. Sem variáveis, o deploy abre a demonstração. Ao configurar Supabase, faça novo deploy. Não versione `.env.local`.

## Critérios das métricas
Seguidores são vínculos, não pessoas únicas. Crescimento compara somente meses consecutivos completos. Períodos parciais não recebem comparação automática. Alcance permanece separado de visualizações e nunca é agregado entre redes. Interações somam somente componentes informados. Concorrentes só aparecem na comparação quando têm as quatro redes e a mesma data. Barras partem de zero. Campos opcionais vazios são ausências, não zero. Conteúdos são ordenados por visualizações, sem ranking de engajamento.

A mídia inicial é uma ilustração local identificada como demonstrativa. Substitua-a em `/admin`. Não há integração com APIs sociais nesta versão.
