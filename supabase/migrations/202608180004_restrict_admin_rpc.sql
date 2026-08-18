-- The function is used only by authenticated admin RLS policies.
-- Remove the implicit PUBLIC/anonymous execution grant while preserving admins.
revoke execute on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated, service_role;
