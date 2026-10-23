# Painel de produtos da MV LEDs (Supabase)

O site funciona normalmente sem esta configuração, usando a lista de `js/products.js`.
Depois de configurado, os produtos passam a vir do banco e o Marcos gerencia tudo em `/admin.html`.

## 1. Criar o projeto

1. Crie uma conta em https://supabase.com e clique em **New project**.
2. Dê um nome (ex.: `mvleds`), crie uma senha do banco e escolha a região **South America (São Paulo)**.

## 2. Criar as tabelas e os produtos

1. No menu lateral, abra **SQL Editor** e clique em **New query**.
2. Cole todo o conteúdo de `supabase/setup.sql` e clique em **Run**.
3. Em **Table Editor > produtos**, confira se os 16 produtos aparecem.

## 3. Ajustar o login

1. **Authentication > Sign In / Providers**: desligue **Allow new users to sign up**
   (assim ninguém cria conta sozinho).
2. **Authentication > URL Configuration**:
   - **Site URL**: `https://mvleds.com.br`
   - **Redirect URLs**: adicione `https://mvleds.com.br/admin.html`

## 4. Criar o usuário do Marcos

1. **Authentication > Users > Add user > Create new user**.
2. Informe o e-mail e a senha dele e marque **Auto Confirm User**.
3. Volte ao **SQL Editor**, cole `supabase/liberar-admin.sql`, troque o e-mail pelo do Marcos e clique em **Run**.

## 5. Conectar o site

1. **Project Settings > API Keys**: copie a **Project URL** e a chave **anon / publishable**.
2. Coloque as duas em `js/config.js` (`SUPABASE_URL` e `SUPABASE_ANON_KEY`) e publique.

A chave anon/publishable pode ficar no site: quem protege os dados são as regras do banco.
Nunca coloque no site a chave **service_role / secret**.

## Uso no dia a dia

- Endereço do painel: `https://mvleds.com.br/admin.html`
- **Olho**: mostra ou esconde o produto no site sem apagar.
- **Setas**: mudam a ordem no catálogo.
- **Lápis**: edita nome, foto, preço, opções, destaques e especificações.
- O LED Projetor mantém o desconto automático do par enquanto as opções se chamarem "1 Unidade" e "Par".
