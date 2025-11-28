'use client'

import { useEffect, useState, useRef, type ReactElement } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { uploadFileToBucket } from "@/utils/supabase/storage"

type Option = { id?: string; name?: string; [k: string]: any }

export default function NewAppointmentPage() {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [durationhours, setDurationHours] = useState<number>(1)
  const [childname, setChildname] = useState("")
  const [childagegroup, setChildagegroup] = useState("")
  const [eventName, setEventName] = useState("")
  const [phone, setPhone] = useState("")
  const [eventaddress, setEventaddress] = useState("")
  const [outofcity, setOutOfCity] = useState(false)
  const [ownerPresent, setOwnerPresent] = useState(false)
  const [recreatorsCount, setRecreatorsCount] = useState<string>('')
  const [valorPago, setValorPago] = useState<string>('')
  const [valorAPagar, setValorAPagar] = useState<string>('')

  const [contractorId, setContractorId] = useState<string | null>(null)
  const [contractors, setContractors] = useState<Option[]>([])
  const [bags, setBags] = useState<Option[]>([])

  const [recreators, setRecreators] = useState<Option[]>([])
  const [responsibleRecreatorId, setResponsibleRecreatorId] = useState<string | null>(null)
  const [recreatorRequested, setRecreatorRequested] = useState(false)
  const [selectedRecreatorId, setSelectedRecreatorId] = useState<string | null>(null)
  const [selectedRecreatorIds, setSelectedRecreatorIds] = useState<string[]>([])
  const [requestedRecreatorIds, setRequestedRecreatorIds] = useState<string[]>([])

  const [proofFile, setProofFile] = useState<File | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [creatorName, setCreatorName] = useState<string>("")
  const [showProofError, setShowProofError] = useState(false)
  const [showContractError, setShowContractError] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [selectedBagId, setSelectedBagId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const proofInputRef = useRef<HTMLInputElement | null>(null)
  const contractInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      const supabase = createClient()
      try {
        const [cres, rres, bres] = await Promise.all([
          supabase.from("Contractor").select('*').order("createdat", { ascending: false }),
          supabase.from("Recreator").select('*').order("createdat", { ascending: false }),
          supabase.from("Bag").select('id, number').order('number', { ascending: true }),
        ])

        const normalize = (rows: any[] | null | undefined) => {
          if (!rows) return []
          return rows.map((r: any) => {
            const id = r.id ?? r.contractorid ?? r.recreatorid ?? r.contractorId ?? r.recreatorId ?? r.user_id ?? r.userId
            const name = r.name ?? r.nome ?? r.fullname ?? r.contractorname ?? r.childname
            const phone = r.phone ?? r.telefone ?? r.phone_number
            const email = r.email ?? r.mail
            return { ...r, id: id ? String(id) : undefined, name: name ?? String(id ?? ''), phone, email }
          })
        }

        if (!mounted) return
        if ((cres as any).error) {
          console.error('Erro ao buscar contratantes:', (cres as any).error)
          setContractors([])
        } else {
          setContractors(normalize((cres as any).data))
        }

        if ((rres as any).error) {
          console.error('Erro ao buscar recreadores:', (rres as any).error)
          setRecreators([])
        } else {
          setRecreators(normalize((rres as any).data))
        }
        if ((bres as any).error) {
          console.error('Erro ao buscar malas:', (bres as any).error)
          setBags([])
        } else {
          const bagRows = (bres as any).data ?? []
          setBags(bagRows.map((b: any) => ({ ...b, id: String(b.id), name: `Mala ${b.number}` })))
        }
      } catch (err) {
        console.error("Erro ao buscar lists para selects:", err)
        setContractors([])
        setRecreators([])
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function checkSession() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setIsAuthenticated(Boolean(data?.session?.user))
      } catch (e) {
        if (!mounted) return
        setIsAuthenticated(false)
      }
    }
    checkSession()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!contractorId) return
    const found = contractors.find((c) => String(c.id ?? c.contractorid) === String(contractorId))
    if (found) {
      setPhone(found.phone ?? "")

      if (!eventaddress && found.address) setEventaddress(found.address)
      const candidate = (found as any).childname || (found as any).childName || (found as any).child_name || (found as any).child || null
      if (candidate) setChildname(String(candidate))
    }
  }, [contractorId, contractors, childname, eventaddress])

  function handleMultiSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const options = Array.from(e.target.selectedOptions)
    const values = options.map((o) => o.value)
    setSelectedRecreatorIds(values)
  }

  function toggleRecreatorSelection(id: string) {
    setSelectedRecreatorIds((prev) => {
      if (!prev) return [id]
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      return [...prev, id]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id ?? null
    const userEmail = sessionData?.session?.user?.email ?? null
    try {
      const selectedContractor = contractors.find((c) => String(c.id ?? c.contractorid) === String(contractorId));
      if (!date || !time) {
        alert("Escolha data e hora")
        setLoading(false)
        return
      }
      if (selectedContractor?.type === 'FISICA' && !childname.trim()) {
        alert("Nome da criança é obrigatório")
        setLoading(false)
        return
      }
      if (!childagegroup.trim()) {
        alert("Faixa etária é obrigatória")
        setLoading(false)
        return
      }
      if (!recreatorsCount || Number(recreatorsCount) <= 0) {
        alert("Quantidade de recreadores é obrigatória e deve ser maior que 0")
        setLoading(false)
        return
      }
      if (!contractorId) {
        alert("Escolha um contratante")
        setLoading(false)
        return
      }
      if (!phone.trim() || !eventaddress.trim()) {
        alert("Preencha telefone e endereço do evento")
        setLoading(false)
        return
      }

      const isJuridica = selectedContractor && (String(selectedContractor.documenttype).toUpperCase() === 'CNPJ');
      if (!isJuridica && !childname.trim()) {
        alert("Preencha o nome da criança")
        setLoading(false)
        return
      }

      if (!userId && !creatorName.trim()) {
        alert('Informe seu nome para registrar quem criou o agendamento')
        setLoading(false)
        return
      }

      if (!proofFile || !contractFile) {
        if (!proofFile) setShowProofError(true)
        if (!contractFile) setShowContractError(true)
        setValidationError('Não é possível criar agendamento sem comprovante e contrato')
        setLoading(false)
        return
      } else {
        setValidationError(null)
      }

      const localDate = new Date(`${date}T${time}`)
      if (![0, 30].includes(localDate.getMinutes())) {
        alert("Escolha horário em intervalos de 30 minutos (ex: 15:00 ou 15:30)")
        setLoading(false)
        return
      }

      // Format the date in local timezone without converting (the date picker already gives us the local date)
      const appointmentdate = `${date} ${time}:00`

      const bucket = "appointments"
      let proof_url: string | null = null
      let contract_url: string | null = null
      if (proofFile) {
        try {
          proof_url = await uploadFileToBucket(bucket, proofFile)
        } catch (err) {
          console.error("Erro ao enviar comprovante:", err)
          alert("Falha ao enviar comprovante")
          setLoading(false)
          return
        }
      }
      if (contractFile) {
        try {
          contract_url = await uploadFileToBucket(bucket, contractFile)
        } catch (err) {
          console.error("Erro ao enviar contrato:", err)
          alert("Falha ao enviar contrato")
          setLoading(false)
          return
        }
      }

      let creatorFromSession: string | null = null

      if (userId) {
        try {
          const { data: profile, error: profileError } = await supabase.from('User').select('name').eq('id', userId).maybeSingle()
          if (!profileError && profile && (profile as any).name) {
            creatorFromSession = (profile as any).name
          }
        } catch (e) {
        }
      }

      if (!creatorFromSession) {
        creatorFromSession = (sessionData?.session?.user?.user_metadata && (sessionData!.session!.user!.user_metadata.full_name || sessionData!.session!.user!.user_metadata.name)) || userEmail || null
      }

      const creatorForDb = (creatorName && creatorName.trim()) ? creatorName.trim() : (creatorFromSession ? String(creatorFromSession) : null)

      const valor_pago_cents = (valorPago && String(valorPago).trim() !== '') ? Math.round(Number(valorPago) * 100) : null
      const valor_a_pagar_cents = (valorAPagar && String(valorAPagar).trim() !== '') ? Math.round(Number(valorAPagar) * 100) : null

      const basePayload: any = {
        appointmentdate,
        eventname: eventName || null,
        durationhours: Number(durationhours) || 1,
        childname,
        childagegroup,
        recreatorscount: Number(recreatorsCount),
        contractorid: contractorId,
        contractorname: selectedContractor?.name ?? null,
        address: selectedContractor?.address ?? eventaddress ?? null,
        phone,
        email: selectedContractor?.email ?? userEmail ?? "",
        eventaddress,
        outofcity,
        ownerpresent: ownerPresent,
        userid: userId,
        created_by: creatorForDb,
      }

      if (valor_pago_cents !== null) basePayload.valor_pago = valor_pago_cents
      if (valor_a_pagar_cents !== null) basePayload.valor_a_pagar = valor_a_pagar_cents

      let defaultColorIndex: number | null = null
      const hasRequestedRecreator = Boolean(recreatorRequested && selectedRecreatorId)
      if (hasRequestedRecreator && ownerPresent) defaultColorIndex = 0
      else if (hasRequestedRecreator) defaultColorIndex = 2
      else if (ownerPresent) defaultColorIndex = 1
      else defaultColorIndex = null

      if (defaultColorIndex !== null) basePayload.color_index = defaultColorIndex

      const { data: insertData, error: insertError } = await supabase.from('Appointment').insert(basePayload).select('id').single()
      if (insertError) {
        console.error('Appointment insert error:', insertError)
        throw insertError
      }

      const createdId = (insertData as any)?.id
      if (!createdId) {
        console.error('Failed to determine created appointment id', insertData)
        throw new Error('Failed to determine created appointment id')
      }

      const updates: any = {}
      if (proof_url) updates.proof_url = proof_url
      if (contract_url) updates.contract_url = contract_url
      if (selectedRecreatorIds && selectedRecreatorIds.length > 0) updates.recreator_ids = selectedRecreatorIds
      if (recreatorRequested && selectedRecreatorId) updates.recreatorid = selectedRecreatorId
      if (selectedBagId) updates.bagid = selectedBagId
      if (responsibleRecreatorId) updates.responsible_recreatorid = responsibleRecreatorId
      if (valor_pago_cents !== null) updates.valor_pago = valor_pago_cents
      if (valor_a_pagar_cents !== null) updates.valor_a_pagar = valor_a_pagar_cents
      if (typeof ownerPresent !== 'undefined') updates.ownerpresent = ownerPresent

      if (Object.keys(updates).length > 0) {
        console.debug('Updating appointment', createdId, 'with optional fields', updates)
        const { data: updatedRow, error: updateError } = await supabase.from('Appointment').update(updates).eq('id', createdId).select('id, proof_url, contract_url, recreator_ids, bagid, color_index, valor_pago, valor_a_pagar').single()
        if (updateError) {
          console.error('Failed to update appointment optional fields:', updateError)
        } else {
          console.debug('Updated appointment optional fields successfully ->', updatedRow)
        }
      } else {
        console.debug('No optional fields to update for appointment', createdId)
      }

      try {
        if (requestedRecreatorIds && requestedRecreatorIds.length > 0) {
          const rows = requestedRecreatorIds.map((rid) => ({ appointment_id: createdId, recreator_id: rid }))
          const { error: relError } = await supabase.from('AppointmentRequestedRecreator').insert(rows)
          if (relError) console.error('Failed to insert requested recreators relations:', relError)
        }
      } catch (err) {
        console.error('Error saving requested recreators relations:', err)
      }

      try {
        const POINTS_BASE = 1
        const POINTS_OUT_OF_CITY_BONUS = 1
        const POINTS_REQUESTED_BONUS = 1

        console.debug('RANKING: selectedRecreatorIds', selectedRecreatorIds, 'requestedRecreatorIds', requestedRecreatorIds, 'outofcity', outofcity, 'responsibleRecreatorId', responsibleRecreatorId)

        const chosenRecreatorIds = new Set<string>()
        if (Array.isArray(selectedRecreatorIds) && selectedRecreatorIds.length > 0) {
          selectedRecreatorIds.forEach((id) => chosenRecreatorIds.add(String(id)))
        }

        const responsibleId = responsibleRecreatorId ? String(responsibleRecreatorId) : null

        const reqSet = new Set<string>()
        if (Array.isArray(requestedRecreatorIds) && requestedRecreatorIds.length > 0) {
          requestedRecreatorIds.forEach((id) => reqSet.add(String(id)))
        }

        const ids = Array.from(chosenRecreatorIds).filter((rid) => {
          const found = recreators.find((r) => String(r.id ?? r.recreatorid) === String(rid))
          return !(found && (found as any).organizer === true)
        })
        if (ids.length > 0) {
          const rows = ids.map((rid) => {
            let points = POINTS_BASE

            if (outofcity) points += POINTS_OUT_OF_CITY_BONUS

            if (reqSet.has(String(rid))) points += POINTS_REQUESTED_BONUS

            return {
              recreatorid: rid,
              appointmentid: createdId,
              pointsawarded: points,
              createdat: new Date().toISOString(),
            }
          })

          console.debug('RANKING: prepared rows for insert', { createdId, rows })

          try {
            const res = await fetch('/api/appointments/ranking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rows }),
            })
            const json = await res.json()
            if (!res.ok) {
              console.error('Failed to insert ranking rows (server):', json)
              toast.error('Não foi possível registrar pontos (ver console). ' + (json?.error ?? ''))
            } else {
              console.debug('Inserted ranking rows for appointment (server)', createdId, json.inserted ?? 0, rows)
            }
          } catch (err) {
            console.error('Failed to call ranking endpoint', err)
            toast.error('Erro ao registrar pontos (ver console).')
          }
        }
      } catch (e) {
        console.error('Error while awarding ranking points:', e)
      }

      router.push('/private/agenda')
    } catch (err: any) {
      console.error("Erro ao criar agendamento:", err)
      alert("Erro ao criar agendamento. Veja console para detalhes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <Toaster />
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Novo Agendamento</h1>

        {validationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de validação</AlertTitle>
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
  <div>
    <Label className="text-sm font-medium">Data*</Label>
    <Input
      name="date"
      type="date"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="mt-2 h-12 px-4 text-base border-2 rounded-lg"
    />
  </div>

  <div>
    <Label className="text-sm font-medium">Hora*</Label>
    <div className="relative mt-2">
      <select
        name="time"
        value={time}
        onChange={e => setTime(e.target.value)}
        className="h-12 w-full px-4 text-base border-2 rounded-lg font-medium appearance-none focus:outline-none focus:ring-2 transition-all shadow-sm"
        required
      >
        <option value="" className="text-gray-400">Selecione o horário</option>
        {(() => {
          const items: ReactElement[] = []
          for (let hour = 0; hour <= 23; hour++) {
            for (const minute of ["00", "30"]) {
              if (hour === 23 && minute === "30") continue
              const value = `${String(hour).padStart(2, "0")}:${minute}`
              items.push(
                <option key={value} value={value} className="text-amber-900 font-bold">
                  {value}
                </option>
              )
            }
          }
          return items
        })()}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-clock"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>
    </div>
  </div>
</div>


            <div>
              <Label className="text-sm font-medium">Nome do evento</Label>
              <Input value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-2 text-base" placeholder="Ex: Festa de aniversário" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <Label className="text-sm font-medium">Duração* (horas)</Label>
                <Input name="durationhours" type="number" min={1} value={String(durationhours)} onChange={(e) => setDurationHours(Number(e.target.value))} className="mt-2 text-base" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Recreador responsável</Label>
              <Select
                onValueChange={(v) => {
                  const val = v || null
                  setResponsibleRecreatorId(val)
                  const found = recreators.find((x) => String(x.id ?? x.recreatorid) === val)
                  if (found) {
                    if (found.phone) setPhone(found.phone ?? "")
                  }
                }}
                defaultValue={responsibleRecreatorId ?? ""}
              >
                <SelectTrigger className="w-full mt-2" >
                  <SelectValue placeholder="-- escolha --" />
                </SelectTrigger>
                <SelectContent>
                  {recreators.map((r) => (
                    <SelectItem key={r.id ?? r.recreatorid} value={String(r.id ?? r.recreatorid)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Contratante*</Label>
              <Select
                onValueChange={(v) => {
                  const val = v || null
                  setContractorId(val)
                  const found = contractors.find((x) => String(x.id ?? x.contractorid) === val)
                  if (found) {
                    setPhone(found.phone ?? "")
                  }
                }}
                defaultValue={contractorId ?? ""}
              >
                <SelectTrigger className="w-full mt-2" >
                  <SelectValue placeholder="-- escolha --" />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((c) => (
                    <SelectItem key={c.id ?? c.contractorid} value={String(c.id ?? c.contractorid)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const selectedContractor = contractors.find(c => String(c.id ?? c.contractorid) === String(contractorId));
              const isJuridica = selectedContractor && (String(selectedContractor.documenttype).toUpperCase() === 'CNPJ');
              if (isJuridica) return null;
              return (
                <div>
                  <Label className="text-sm font-medium">Nome da criança</Label>
                  <Input value={childname} onChange={(e) => setChildname(e.target.value)} className="mt-2 text-base" />
                </div>
              );
            })()}

            <div>
              <Label className="text-sm font-medium">Faixa etária da criança*</Label>
              <Input value={childagegroup} onChange={(e) => setChildagegroup(e.target.value)} className="mt-2 text-base" placeholder="Ex: 3-5 anos" />
            </div>

            <div>
              <Label className="text-sm font-medium">Quantidade de recreadores presentes *</Label>
              <Input
                type="number"
                min="1"
                value={recreatorsCount}
                onChange={(e) => {
                  const raw = String(e.target.value || '')
                  const digits = raw.replace(/\D/g, '')
                  const normalized = digits.replace(/^0+(?=\d)/, '')
                  setRecreatorsCount(normalized)
                }}
                className="mt-2 text-base"
                placeholder="Ex: 2"
              />
              <p className="text-xs text-muted-foreground mt-2">Informe quantos recreadores estarão presentes no evento</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Recreadores do evento</Label>
              <div className="mt-2 w-full border rounded px-3 py-2 h-48 sm:h-40 overflow-auto bg-white">
                {recreators.map((r) => {
                  const id = String(r.id ?? r.recreatorid)
                  const checked = selectedRecreatorIds.includes(id)
                  return (
                    <div key={id} className="flex items-center gap-3 py-2">
                      <Checkbox checked={checked} onCheckedChange={() => {
                        setSelectedRecreatorIds((prev) =>
                          checked
                            ? prev.filter((rid) => rid !== id)
                            : [...prev, id]
                        );
                      }} className="shrink-0" />
                      <span className="select-none text-sm">{r.name}</span>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Marque os recreadores que estarão presentes no evento.</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Telefone*</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 text-base" />
            </div>

            <div>
              <Label className="text-sm font-medium">Endereço do evento*</Label>
              <Textarea value={eventaddress} onChange={(e) => setEventaddress(e.target.value)} className="mt-2 text-base" />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="outofcity" checked={outofcity} onCheckedChange={(v: boolean) => setOutOfCity(Boolean(v))} className="shrink-0" />
              <Label htmlFor="outofcity" className="text-sm font-medium cursor-pointer">Fora da cidade</Label>
            </div>

            <div>
              <Label className="text-sm font-medium">Mala</Label>
              <Select
                onValueChange={(v) => setSelectedBagId(v || null)}
                defaultValue={selectedBagId ?? ""}
              >
                <SelectTrigger className="w-full mt-2" >
                  <SelectValue placeholder="-- escolha --" />
                </SelectTrigger>
                <SelectContent>
                  {bags.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <Label className="text-sm font-medium">Valor pago</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                  className="mt-2 text-base"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Valor a pagar</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorAPagar}
                  onChange={(e) => setValorAPagar(e.target.value)}
                  className="mt-2 text-base"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-3 w-full">
              <Label className="text-sm font-medium">Comprovante (arquivo)*</Label>
              <div className="flex flex-col gap-3 w-full">
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,.img"
                  className="hidden"
                  onChange={(e) => { setProofFile(e.target.files?.[0] ?? null); setShowProofError(false) }}
                />
                <Button type="button" variant="outline" onClick={() => proofInputRef.current?.click()} className="w-full">
                  Selecionar arquivo
                </Button>
                <div className="text-sm text-muted-foreground break-all">
                  {proofFile ? proofFile.name : <span className="italic">Nenhum arquivo selecionado</span>}
                </div>
                {showProofError && (
                  <div className="text-sm text-red-600">Comprovante obrigatório</div>
                )}
              </div>
            </div>

            {isAuthenticated === false && (
              <div>
                <Label className="text-sm font-medium">Seu nome</Label>
                <Input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="mt-2 text-base" placeholder="Seu nome completo" />
                <p className="text-xs text-muted-foreground mt-2">Informe seu nome para registrar quem criou este agendamento.</p>
              </div>
            )}

            <div className="space-y-3 w-full">
              <Label className="text-sm font-medium">Contrato (PDF)*</Label>
              <div className="flex flex-col gap-3 w-full">
                <input
                  ref={contractInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { setContractFile(e.target.files?.[0] ?? null); setShowContractError(false) }}
                />
                <Button type="button" variant="outline" onClick={() => contractInputRef.current?.click()} className="w-full">
                  Selecionar PDF
                </Button>
                <div className="text-sm text-muted-foreground break-all">
                  {contractFile ? contractFile.name : <span className="italic">Nenhum arquivo selecionado</span>}
                </div>
                {showContractError && (
                  <div className="text-sm text-red-600">Contrato obrigatório</div>
                )}
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className="flex items-center gap-3">
                <Checkbox checked={recreatorRequested} onCheckedChange={(v: boolean) => setRecreatorRequested(Boolean(v))} className="shrink-0" />
                <Label className="text-sm font-medium cursor-pointer">Possui recreador solicitado pela mãe?</Label>
              </div>
              {recreatorRequested && (
                <div className="border rounded px-4 py-3 bg-white">
                  <Label className="block mb-3 text-sm font-medium">Selecione os recreadores solicitados:</Label>
                  {recreators.map((r) => {
                    const id = String(r.id ?? r.recreatorid);
                    const checked = requestedRecreatorIds.includes(id);
                    return (
                      <div key={id} className="flex items-center gap-3 py-2">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => {
                            setRequestedRecreatorIds((prev) =>
                              checked
                                ? prev.filter((rid) => rid !== id)
                                : [...prev, id]
                            );
                          }}
                          className="shrink-0"
                        />
                        <span className="select-none text-sm">{r.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Button type="submit" disabled={loading} className="w-full sm:flex-1 text-base py-3">{loading ? "Criando..." : "Criar Agendamento"}</Button>
              <Button variant="outline" onClick={() => router.back()} className="w-full sm:flex-1 text-base py-3">Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
