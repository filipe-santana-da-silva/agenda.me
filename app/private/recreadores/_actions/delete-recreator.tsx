'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const formSchema = z.object({
  recreadorId: z.string().min(1, 'O ID do recreador é obrigatório'),
})

type FormSchema = z.infer<typeof formSchema>

export async function deleteRecreator(formData: FormSchema) {
  const supabase = createClient()
  const {
    data: { session },
  } = await (await supabase).auth.getSession()

  if (!session?.user?.id) {
    return {
      error: 'Você precisa estar autenticado para deletar um recreador.',
    }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    }
  }

  const { error } = await (await supabase)
    .from('Recreator')
    .delete()
    .match({
      id: formData.recreadorId,
      userId: session.user.id,
    })

  if (error) {
    console.error(error)
    return {
      error: 'Erro ao deletar recreador.',
    }
  }

  revalidatePath('/private/recreadores')

  return {
    data: 'Recreador deletado com sucesso!',
  }
}
