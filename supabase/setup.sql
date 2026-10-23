-- MV LEDs: catálogo de produtos no Supabase
-- Rode este arquivo inteiro uma vez em: Supabase > SQL Editor > New query > Run

create table if not exists public.produtos (
  id text primary key,
  name text not null,
  category text not null check (category in ('led', 'interno', 'placa', 'halogena', 'servicos')),
  image text,
  short_desc text,
  description text,
  specs jsonb not null default '[]'::jsonb,
  variants jsonb,
  price numeric(10, 2) check (price is null or price >= 0),
  price_on_request boolean not null default false,
  price_label text,
  price_unit text,
  price_note text,
  highlights text[] not null default '{}',
  power integer check (power is null or power > 0),
  badge jsonb,
  active boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists produtos_updated_at on public.produtos;
create trigger produtos_updated_at
  before update on public.produtos
  for each row execute function public.touch_updated_at();

alter table public.produtos enable row level security;
alter table public.admins enable row level security;

drop policy if exists "produtos: leitura publica" on public.produtos;
create policy "produtos: leitura publica" on public.produtos
  for select using (active or public.is_admin());

drop policy if exists "produtos: admin insere" on public.produtos;
create policy "produtos: admin insere" on public.produtos
  for insert to authenticated with check (public.is_admin());

drop policy if exists "produtos: admin altera" on public.produtos;
create policy "produtos: admin altera" on public.produtos
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "produtos: admin remove" on public.produtos;
create policy "produtos: admin remove" on public.produtos
  for delete to authenticated using (public.is_admin());

drop policy if exists "admins: ve a si mesmo" on public.admins;
create policy "admins: ve a si mesmo" on public.admins
  for select to authenticated using (user_id = auth.uid());

grant select on public.produtos to anon, authenticated;
grant insert, update, delete on public.produtos to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Fotos dos produtos (bucket público para leitura, escrita só do admin)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "fotos: admin lista" on storage.objects;
create policy "fotos: admin lista" on storage.objects
  for select to authenticated using (bucket_id = 'produtos' and public.is_admin());

drop policy if exists "fotos: admin envia" on storage.objects;
create policy "fotos: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos' and public.is_admin());

drop policy if exists "fotos: admin altera" on storage.objects;
create policy "fotos: admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'produtos' and public.is_admin());

drop policy if exists "fotos: admin remove" on storage.objects;
create policy "fotos: admin remove" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos' and public.is_admin());

-- Produtos atuais do site
insert into public.produtos (id, name, category, image, short_desc, description, specs, variants, price, price_on_request, price_label, price_unit, price_note, highlights, power, badge, active, position) values
  ('led-10k', 'Lâmpada LED 10 Mil Lúmens', 'led', 'assets/images/led-10mil.jpeg', 'A porta de entrada da linha LED: luz branca e proteção contra água.', 'Lâmpada de LED automotiva com 10 mil lúmens de potência luminosa. Cor 6000K branco frio, com proteção à prova d''água. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.', '[{"label":"Potência luminosa","value":"10.000 lúmens"},{"label":"Temperatura de cor","value":"6000K · Branco frio"},{"label":"Proteção","value":"À prova d''água"},{"label":"Garantia","value":"6 meses"}]'::jsonb, '[{"id":"outros","label":"H1, H7, H11, HB3/4","price":130},{"id":"h4","label":"Encaixe H4","price":160}]'::jsonb, null, false, null, null, null, array['6000K', 'À prova d''água', 'Garantia 6 meses'], 10, null, true, 10),
  ('led-15k', 'Lâmpada LED 15 Mil Lúmens', 'led', 'assets/images/led-15mil.jpeg', 'Mais luz para o dia a dia, com o dobro da garantia da linha de entrada.', 'Lâmpada de LED automotiva com 15 mil lúmens de potência luminosa e garantia estendida de 1 ano. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.', '[{"label":"Potência luminosa","value":"15.000 lúmens"},{"label":"Garantia","value":"1 ano"}]'::jsonb, '[{"id":"outros","label":"H1, H7, H11, HB3/4","price":200},{"id":"h4","label":"Encaixe H4","price":230}]'::jsonb, null, false, null, null, null, array['Garantia 1 ano'], 15, null, true, 20),
  ('led-22k', 'Lâmpada LED 22 Mil Lúmens', 'led', 'assets/images/led-22mil.jpeg', 'Alta performance para quem roda à noite com frequência.', 'Lâmpada de LED automotiva com 22 mil lúmens de potência luminosa e garantia de 1 ano. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.', '[{"label":"Potência luminosa","value":"22.000 lúmens"},{"label":"Garantia","value":"1 ano"}]'::jsonb, '[{"id":"outros","label":"H1, H7, H11, HB3/4","price":270},{"id":"h4","label":"Encaixe H4","price":300}]'::jsonb, null, false, null, null, null, array['Garantia 1 ano'], 22, null, true, 30),
  ('led-30k', 'Lâmpada LED 30 Mil Lúmens', 'led', 'assets/images/led-30mil.jpeg', 'A mais forte entre as lâmpadas com preço fixo de tabela.', 'Lâmpada de LED automotiva com 30 mil lúmens de potência luminosa — a mais forte da tabela de valores — com garantia de 1 ano. O preço varia de acordo com o encaixe do seu veículo — selecione abaixo.', '[{"label":"Potência luminosa","value":"30.000 lúmens"},{"label":"Garantia","value":"1 ano"}]'::jsonb, '[{"id":"outros","label":"H1, H7, H11, HB3/4","price":350},{"id":"h4","label":"Encaixe H4","price":380}]'::jsonb, null, false, null, null, null, array['Garantia 1 ano'], 30, null, true, 40),
  ('led-40k-premium', 'Lâmpada LED 40 Mil Lúmens — Linha Premium', 'led', 'assets/images/card-led-forte.jpeg', 'A lâmpada mais forte do catálogo, em alta potência e 6000K.', 'A lâmpada de LED mais forte do catálogo da MV LEDs: 40 mil lúmens, cor 6000K branco frio e alta potência, com 1 ano de garantia. Valor sob consulta — fale com a gente pelo WhatsApp para o encaixe do seu veículo.', '[{"label":"Potência luminosa","value":"40.000 lúmens"},{"label":"Temperatura de cor","value":"6000K · Branco frio"},{"label":"Potência","value":"Alta potência"},{"label":"Garantia","value":"1 ano"}]'::jsonb, null, null, true, null, null, null, array['6000K', 'Garantia 1 ano'], 40, '{"text":"Topo de linha","tone":"red"}'::jsonb, true, 50),
  ('led-projetor', 'LED Projetor', 'led', 'assets/images/led-projetor.jpeg', 'Kit projetor de LED de alta performance, avulso ou no par com desconto.', 'Kit LED Projetor de alta performance, 6000K e 12V. Leve a unidade avulsa por R$ 150 ou o par por R$ 280 — economia de R$ 20 em relação a duas unidades.', '[{"label":"Tonalidade","value":"6000K"},{"label":"Voltagem","value":"12V"},{"label":"Unidade","value":"R$ 150,00"},{"label":"Par","value":"R$ 280,00"}]'::jsonb, '[{"id":"unidade","label":"1 Unidade","price":150},{"id":"par","label":"Par (2 unidades) · Com desconto","price":280}]'::jsonb, null, false, null, null, 'ou R$ 280 o par', array['6000K', '12V'], null, '{"text":"Par com desconto","tone":"green"}'::jsonb, true, 60),
  ('pingo-led-projetor', 'Pingo de LED T10 com Projetor', 'led', 'assets/images/pingo-led-projetor.jpg', 'Pingo com lente projetora e luz super branca, sem erro no painel.', 'O pingo de LED mais forte do mercado! Modelo equipado com lente projetora frontal e 1600 lúmens de fluxo luminoso, proporcionando luz super branca de alta definição. Já vem com sistema Canbus integrado, evitando avisos de lâmpada queimada no painel.', '[{"label":"Encaixe","value":"T10 / W5W (Pingo)"},{"label":"Luminosidade","value":"1600 Lúmens"},{"label":"Temperatura de cor","value":"6000K · Branco Frio"},{"label":"Construção","value":"Lente com Mini Projetor"},{"label":"Tecnologia","value":"Canbus integrado (Sem erro no painel)"}]'::jsonb, null, 60, false, 'Preço do par', 'par', null, array['1600 lm', '6000K', 'Canbus'], null, null, true, 70),
  ('kit-led-interno', 'Kit LED Interno', 'interno', 'assets/images/card-kit-interno.jpeg', 'Teto, portas e demais pontos internos com mais claridade e baixo consumo.', 'Kit de LED para iluminação interna do veículo (teto, portas e demais pontos internos). Compatível com todos os veículos, com mais claridade e baixo consumo de energia.', '[{"label":"Compatibilidade","value":"Todos os veículos"},{"label":"Claridade","value":"Mais claridade"},{"label":"Consumo","value":"Baixo consumo de energia"},{"label":"Durabilidade","value":"Durabilidade e resistência"},{"label":"Instalação","value":"Fácil instalação"}]'::jsonb, null, 20, false, 'A partir de', 'lâmpada', null, array['Todos os veículos', 'Baixo consumo'], null, null, true, 80),
  ('torpedo-led', 'Torpedo LED (31mm a 41mm)', 'interno', 'assets/images/prod-torpedo.jpeg', 'Para luz de teto, porta-malas e outros pontos internos.', 'Lâmpada torpedo de LED, tamanhos de 31mm a 41mm, indicada para luz de teto, porta-malas e outros pontos internos do veículo.', '[{"label":"Tamanho","value":"31mm a 41mm"}]'::jsonb, null, 20, false, null, 'unidade', null, array['31 a 41 mm'], null, null, true, 90),
  ('led-placa', 'Lâmpada LED para Placa', 'placa', 'assets/images/card-led-placa.jpeg', 'Placa bem iluminada, com instalação simples e acabamento discreto.', 'Lâmpada de LED para iluminação da placa do veículo. Instalação simples e acabamento discreto.', '[{"label":"Aplicação","value":"Iluminação de placa"}]'::jsonb, null, 20, false, 'A partir de', 'unidade', null, array['Instalação simples'], null, null, true, 100),
  ('halogena-unidade', 'Lâmpada Halógena', 'halogena', 'assets/images/prod-halogena-unidade.jpeg', 'Encaixes H1, H3, H4, HB3, HB4, H11 e outros. Shocklight, Osram e Cindy.', 'Lâmpada halógena avulsa, disponível para diversos encaixes (H1, H3, H4, HB3, HB4, H11, entre outros), compatível com todos os veículos. Marcas como Shocklight, Osram e Cindy disponíveis em loja.', '[{"label":"Compatibilidade","value":"Para todos os veículos"},{"label":"Garantia","value":"3 meses"}]'::jsonb, null, 35, false, null, 'unidade', null, array['Todos os veículos', 'Garantia 3 meses'], null, null, true, 110),
  ('super-brancas', 'Lâmpadas Super Brancas', 'halogena', 'assets/images/prod-super-brancas.jpeg', 'Luz mais branca que a halógena comum, sem precisar trocar para LED.', 'Lâmpada halógena super branca, com luz mais próxima do branco em comparação à halógena comum, sem precisar trocar para LED.', '[{"label":"Tipo","value":"Halógena super branca"}]'::jsonb, null, 70, false, null, 'unidade', null, array['Halógena'], null, null, true, 120),
  ('t10-halogena', 'T10 Halógena', 'halogena', 'assets/images/prod-t10.jpeg', 'Para lanternas, placa e luz de posição.', 'Lâmpada halógena modelo T10, usada em lanternas, placa e luz de posição.', '[{"label":"Modelo","value":"T10"}]'::jsonb, null, 10, false, null, 'unidade', null, array['T10'], null, null, true, 130),
  ('halogena-1-2-polos', 'Halógena 1 Polo / 2 Polos', 'halogena', 'assets/images/prod-1polo-2polos.jpeg', 'Para setas e lanternas.', 'Lâmpada halógena em versão 1 polo ou 2 polos, usada em setas e lanternas.', '[{"label":"Modelo","value":"1 polo / 2 polos"}]'::jsonb, null, 15, false, null, 'unidade', null, array['1 ou 2 polos'], null, null, true, 140),
  ('regulagem-farol', 'Regulagem de Farol', 'servicos', 'assets/images/servico-regulagem-farol.jpeg', 'Serviço feito na loja pela equipe da MV LEDs.', 'Serviço de regulagem de farol, feito na loja pela equipe da MV LEDs.', '[{"label":"Tipo","value":"Serviço"}]'::jsonb, null, 40, false, null, null, null, array['Feito na loja'], null, null, true, 150),
  ('revitalizacao-farol', 'Revitalização de Faróis', 'servicos', 'assets/images/servico-revitalizacao-farol.jpeg', 'Devolve a transparência e o brilho do farol, com vitrificação.', 'Serviço de revitalização de faróis com vitrificação, devolvendo a transparência e o brilho do farol.', '[{"label":"Inclui","value":"Vitrificação"}]'::jsonb, null, 200, false, null, null, null, array['Com vitrificação'], null, null, true, 160)
on conflict (id) do nothing;
