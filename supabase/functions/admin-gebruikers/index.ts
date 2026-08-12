import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // Verifieer dat de aanvrager een ingelogde admin is
    const auth = req.headers.get('Authorization')
    if (!auth) return json({ error: 'Niet ingelogd' }, 401)

    const caller = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: auth } } }
    )

    const { data: { user }, error: authErr } = await caller.auth.getUser()
    if (authErr || !user) return json({ error: 'Niet ingelogd' }, 401)

    const { data: rollen } = await caller.from('user_roles').select('rol').eq('user_email', user.email)
    const isAdmin = (rollen || []).some((r: { rol: string }) => r.rol === 'admin')
    if (!isAdmin) return json({ error: 'Geen admin-rechten' }, 403)

    // Admin client — service key is veilig beschikbaar als omgevingsvariabele
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { actie, ...params } = await req.json()

    if (actie === 'maakAan') {
      const { email, wachtwoord, naam } = params
      const { data, error } = await admin.auth.admin.createUser({ email, password: wachtwoord, email_confirm: true })
      if (error) return json({ error: error.message }, 400)
      if (naam) await admin.from('profiles').update({ naam }).eq('email', email)
      return json({ data })
    }

    if (actie === 'verwijder') {
      const { userId } = params
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) return json({ error: error.message }, 400)
      return json({ success: true })
    }

    if (actie === 'updateWachtwoord') {
      const { userId, wachtwoord } = params
      const { error } = await admin.auth.admin.updateUserById(userId, { password: wachtwoord })
      if (error) return json({ error: error.message }, 400)
      return json({ success: true })
    }

    return json({ error: 'Onbekende actie' }, 400)

  } catch (err) {
    return json({ error: (err as Error).message }, 500)
  }
})
