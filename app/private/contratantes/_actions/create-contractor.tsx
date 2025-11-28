'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Schema de validação com todos os campos obrigatórios
const formSchema = z.object({
  // personType is optional here; client will provide. childname optional for juridica
  personType: z.string().optional(),
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  childname: z.string().optional(),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  documenttype: z.string().min(1, { message: 'O tipo de documento é obrigatório' }),
  documentvalue: z.string().min(1, { message: 'O número do documento é obrigatório' }),
  maritalstatus: z.string().optional(),
  profession: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate document based on type
  if (data.documenttype && data.documentvalue) {
    const digitsOnly = data.documentvalue.replace(/\D/g, '')
    
    if (data.documenttype === 'CPF' && digitsOnly.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF deve conter exatamente 11 dígitos',
        path: ['documentvalue'],
      })
    }
    
    if (data.documenttype === 'RG' && (digitsOnly.length < 7 || digitsOnly.length > 9)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RG deve conter de 7 a 9 dígitos',
        path: ['documentvalue'],
      })
    }
  }
})

type FormSchema = z.infer<typeof formSchema>

export async function createContractor(formData: FormSchema) {
  const supabase = createClient()
  const {
    data: { user },
  } = await (await supabase).auth.getUser()

  if (!user?.id) {
    return {
      error: 'Você precisa estar autenticado para cadastrar um contratante.',
    }
  }

  const schema = formSchema.safeParse(formData)
  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    }
  }

  try {
    // quick env debug to help on production where envs may be misconfigured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase env vars missing on server:', {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      })
    }

    const { data, error } = await (await supabase)
      .from('Contractor')
      .insert({
        name: formData.name,
        childname: formData.childname,
        phone: formData.phone,
        maritalstatus: formData.maritalstatus ?? null,
        profession: formData.profession ?? null,
        address: formData.address,
        documenttype: formData.documenttype,
        documentvalue: formData.documentvalue,
        createdat: new Date().toISOString(),
        updatedat: new Date().toISOString(),
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error (Contractor):', error)
      return { error: error.message }
    }

    // ensure we revalidate the correct path (Portuguese folder `contratantes`)
    try {
      revalidatePath('/private/contratantes')
    } catch (revalErr) {
      // non-fatal in case revalidation is disabled in the environment
      console.debug('revalidatePath failed (non-fatal):', revalErr)
    }

    return { data }
  } catch (err) {
    // Try to return a helpful message when possible
    console.error('createContractor unexpected error:', err)
    const message = (err as any)?.message || String(err)
    return { error: `Erro ao cadastrar contratante: ${message}` }
  }
}
