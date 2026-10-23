-- Depois de criar o usuário do Marcos em Authentication > Users > Add user,
-- troque o e-mail abaixo pelo e-mail dele e rode este arquivo no SQL Editor.

insert into public.admins (user_id)
select id from auth.users where email = 'EMAIL_DO_MARCOS@exemplo.com'
on conflict (user_id) do nothing;
