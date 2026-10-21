-- A função do gatilho de cadastro é SECURITY DEFINER e só deve rodar pelo gatilho
-- em auth.users, nunca pela API (/rest/v1/rpc/handle_new_user).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
