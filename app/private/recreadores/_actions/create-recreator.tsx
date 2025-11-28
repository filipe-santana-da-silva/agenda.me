'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  // new skills object (levels 0-5)
  skills: z.object({
    recreacao: z.number().min(0).max(5),
    pintura: z.number().min(0).max(5),
    balonismo: z.number().min(0).max(5),
    oficina: z.number().min(0).max(5),
  }).optional(),
  rg: z.string().min(1, { message: 'O RG é obrigatório' }),
  cpf: z.string().min(1, { message: 'O CPF é obrigatório' }),
  phone: z.string().min(1, { message: 'O telefone é obrigatório' }),
  address: z.string().min(1, { message: 'O endereço é obrigatório' }),
  pixKey: z.string().optional(),
  uniformSize: z.string().optional(),
  notes: z.string().optional(),
  availabledays: z.array(z.string()).optional(), // ✅ compatível com jsonb
  organizer: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Validate CPF format
  if (data.cpf) {
    const cpfDigits = data.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF deve conter exatamente 11 dígitos',
        path: ['cpf'],
      })
    }
  }
  
  // Validate RG format (7-9 digits)
  if (data.rg) {
    const rgDigits = data.rg.replace(/\D/g, '')
    if (rgDigits.length < 7 || rgDigits.length > 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'RG deve conter de 7 a 9 dígitos',
        path: ['rg'],
      })
    }
  }
})

type FormSchema = z.infer<typeof formSchema>

export async function createRecreator(formData: FormSchema) {
  try {
    const supabase = await createClient()

    // ✅ Validação do schema
    const schema = formSchema.safeParse(formData)
    if (!schema.success) {
      return {
        error: schema.error.issues[0].message,
      }
    }

    // ✅ Autenticação segura
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return {
        error: 'Você precisa estar autenticado para cadastrar um recreador.',
      }
    }

    // prepare skills payload: prefer new skills, fallback to legacy specialty fields if provided
    const skillsPayload = (formData as any).skills ?? (() => {
      // if legacy fields exist on formData, map them
      const legacySpec = (formData as any).specialty
      const legacyLevel = (formData as any).specialtylevel ?? 0
      const s: any = { recreacao: 0, pintura: 0, balonismo: 0, oficina: 0 }
      if (legacySpec && typeof legacyLevel === 'number') {
        const key = legacySpec.toString().toLowerCase()
        if (key.includes('pintura')) s.pintura = legacyLevel
        else if (key.includes('balon')) s.balonismo = legacyLevel
        else if (key.includes('oficina')) s.oficina = legacyLevel
        else s.recreacao = legacyLevel
      }
      return s
    })()

    // ✅ Inserção no Supabase (skills stored in jsonb column `skills`)
    const { error, data } = await supabase
      .from('Recreator')
      .insert([{
        name: formData.name,
        skills: skillsPayload,
        rg: formData.rg,
        cpf: formData.cpf,
        phone: formData.phone,
        organizer: formData.organizer ?? false,
        pixKey: formData.pixKey ?? null,
        uniformSize: formData.uniformSize ?? null,
        address: formData.address,
        notes: formData.notes,
        availabledays: formData.availabledays, // ✅ enviado como array
        userId: user.id,
      }])
      .select()
      .single()

    if (error) {
      console.error(error)
      return {
        error: 'Erro ao cadastrar recreador.',
      }
    }

    revalidatePath('/private/recreadores')

    return {
      data,
    }
  } catch (err) {
    console.error('createRecreator unexpected error', err)
    return { error: 'Erro inesperado no servidor ao cadastrar recreador.' }
  }
}
