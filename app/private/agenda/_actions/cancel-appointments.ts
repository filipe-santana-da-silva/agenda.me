'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  appointmentId: z.string().min(1, 'Você precisa fornecer um agendamento')
})

type FormSchema = z.infer<typeof formSchema>

export async function cancelAppointment(formData: FormSchema) {
  const supabase = createClient()
  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0]?.message
    }
  }

  const { data: userData, error: authError } = await (await supabase).auth.getUser()
  const user = userData?.user

  if (!user || authError) {
    return {
      error: 'Usuário não encontrado!'
    }
  }

  try {
    // Check whether the current user has ADMIN role (lookup in user_permission by email)
    let isAdmin = false
    try {
      const email = (user.email || '').toString()
      const { data: papel } = await (await supabase)
        .from('user_permission')
        .select('role:role_id(name)')
        .ilike('email', email)
        .maybeSingle()

      const roleName = Array.isArray((papel as any)?.role)
        ? (papel as any).role[0]?.name
        : (papel as any)?.role?.name

      if ((roleName || '').toUpperCase() === 'ADMIN') {
        isAdmin = true
      }
    } catch (e) {
      // ignore role lookup errors and fall back to non-admin behavior
      console.warn('Role lookup failed in cancelAppointment:', e)
    }

    // Perform delete: admins may delete any appointment; others can only delete their own (userid)
    let deletedRows: any = null
    let deleteError: any = null
    if (isAdmin) {
      const res = await (await supabase).from('Appointment').delete().match({ id: formData.appointmentId }).select()
      deletedRows = res.data
      deleteError = res.error
    } else {
      const res = await (await supabase)
        .from('Appointment')
        .delete()
        .match({
          id: formData.appointmentId,
          userid: user.id,
        })
        .select()
      deletedRows = res.data
      deleteError = res.error
    }

    if (deleteError) {
      throw deleteError
    }

    // If nothing was deleted, return a helpful error (either not found or not owned by this user)
    if (!deletedRows || (Array.isArray(deletedRows) && deletedRows.length === 0)) {
      return {
        error: 'Agendamento não encontrado ou você não tem permissão para deletá-lo.'
      }
    }

    revalidatePath('/private/agenda') // opcional, se quiser atualizar a página

    return {
      data: 'Agendamento cancelado com sucesso!'
    }
  } catch (err) {
    console.error(err)
    return {
      error: 'Ocorreu um erro ao deletar este agendamento'
    }
  }
}
