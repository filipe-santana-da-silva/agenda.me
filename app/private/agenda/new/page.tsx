"use client"

import { useEffect, useState, useRef } from "react"
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
    // load contractors and recreators for selects
    let mounted = true
    async function load() {
      const supabase = createClient()
      try {
        // Request full rows and normalize client-side to tolerate different column names
        const [cres, rres, bres] = await Promise.all([
          supabase.from("Contractor").select('*').order("createdat", { ascending: false }),
          supabase.from("Recreator").select('*').order("createdat", { ascending: false }),
          supabase.from("Bag").select('id, number').order('number', { ascending: true }),
        ])

        // cres and rres are PostgrestResponse objects
        // normalize into { id, name, phone, email }
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
          // eslint-disable-next-line no-console
          console.error('Erro ao buscar contratantes:', (cres as any).error)
          setContractors([])
        } else {
          setContractors(normalize((cres as any).data))
        }

        if ((rres as any).error) {
          // eslint-disable-next-line no-console
          console.error('Erro ao buscar recreadores:', (rres as any).error)
          setRecreators([])
        } else {
          setRecreators(normalize((rres as any).data))
        }
        // bags
        if ((bres as any).error) {
          // eslint-disable-next-line no-console
          console.error('Erro ao buscar malas:', (bres as any).error)
          setBags([])
        } else {
          const bagRows = (bres as any).data ?? []
          setBags(bagRows.map((b: any) => ({ ...b, id: String(b.id), name: `Mala ${b.number}` })))
        }
      } catch (err) {
        // eslint-disable-next-line no-console
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

  // detect auth state to conditionally show creator name input
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

  // whenever a contractor is selected, auto-fill contact fields (phone)
  useEffect(() => {
    if (!contractorId) return
    const found = contractors.find((c) => String(c.id ?? c.contractorid) === String(contractorId))
    if (found) {
      // always update phone reactively when contractor changes
      setPhone(found.phone ?? "")

      // if event address is empty, prefill from contractor address when available
      if (!eventaddress && found.address) setEventaddress(found.address)

      // always update the child name reactively from contractor data when available
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
      // basic validation
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

      // Se for pessoa física, exige nome da criança
      const isJuridica = selectedContractor && (String(selectedContractor.documenttype).toUpperCase() === 'CNPJ');
      if (!isJuridica && !childname.trim()) {
        alert("Preencha o nome da criança")
        setLoading(false)
        return
      }

      // when user is not authenticated, require creator name
      if (!userId && !creatorName.trim()) {
        alert('Informe seu nome para registrar quem criou o agendamento')
        setLoading(false)
        return
      }

      // require attachments (comprovante e contrato)
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
      // enforce closed 30-minute boundary (minutes === 00 or 30)
      if (![0, 30].includes(localDate.getMinutes())) {
        alert("Escolha horário em intervalos de 30 minutos (ex: 15:00 ou 15:30)")
        setLoading(false)
        return
      }

      const appointmentdate = format(localDate, "yyyy-MM-dd HH:mm:ss")

  // uploads
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


  // selectedContractor já definido acima

  // determine creator name to store:
  // Prefer the profile `User.name` (the name the user entered at login) when the user is authenticated.
  // If that's not available, fall back to session metadata (full_name/name) or email.
  // If unauthenticated, use the explicit `creatorName` input.
  let creatorFromSession: string | null = null

  if (userId) {
    try {
      const { data: profile, error: profileError } = await supabase.from('User').select('name').eq('id', userId).maybeSingle()
      if (!profileError && profile && (profile as any).name) {
        creatorFromSession = (profile as any).name
      }
    } catch (e) {
      // ignore profile read errors
    }
  }

  if (!creatorFromSession) {
    creatorFromSession = (sessionData?.session?.user?.user_metadata && (sessionData!.session!.user!.user_metadata.full_name || sessionData!.session!.user!.user_metadata.name)) || userEmail || null
  }

  const creatorForDb = (creatorName && creatorName.trim()) ? creatorName.trim() : (creatorFromSession ? String(creatorFromSession) : null)

    const payloadAny: any = {
      appointmentdate,
      eventname: eventName || null,
      durationhours: Number(durationhours) || 1,
        childname,
        childagegroup,
        contractorid: contractorId,
        contractorname: selectedContractor?.name ?? null,
        // some schemas still require `address` (legacy). Prefer contractor address, fallback to eventaddress.
        address: selectedContractor?.address ?? eventaddress ?? null,
        phone,
        // Appointment.email is NOT NULL in some schemas: prefer contractor email, then authenticated user email, else empty string
        email: selectedContractor?.email ?? userEmail ?? "",
        eventaddress,
        outofcity,
        ownerpresent: ownerPresent,
        bagid: selectedBagId,
        responsible_recreatorid: responsibleRecreatorId,
        userid: userId,
        // creator name if provided (saved to appointment.created_by)
        created_by: creatorForDb,
      }

      // optional fields - include if available
      if (proof_url) payloadAny.proof_url = proof_url
      if (contract_url) payloadAny.contract_url = contract_url
      // include recreators selection (multi) and single requested recreator
  if (selectedRecreatorIds && selectedRecreatorIds.length > 0) payloadAny.recreator_ids = selectedRecreatorIds
  if (recreatorRequested && selectedRecreatorId) payloadAny.recreatorid = selectedRecreatorId

      // Insert appointment base record first (avoid schema issues when optional columns differ).
    const basePayload: any = {
      appointmentdate,
      eventname: eventName || null,
      durationhours: Number(durationhours) || 1,
        childname,
        childagegroup,
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
        // color_index: will be set based on owner/recreator defaults below
      }

      // Determine default color index according to rules:
      // - if recreator requested by mother AND owner present -> index 0
      // - else if recreator requested by mother -> index 2 (3rd color)
      // - else if owner present -> index 1 (2nd color)
      // - else -> no default color (store null -> white)
      let defaultColorIndex: number | null = null
      const hasRequestedRecreator = Boolean(recreatorRequested && selectedRecreatorId)
      if (hasRequestedRecreator && ownerPresent) defaultColorIndex = 0
      else if (hasRequestedRecreator) defaultColorIndex = 2
      else if (ownerPresent) defaultColorIndex = 1
      else defaultColorIndex = null

      if (defaultColorIndex !== null) basePayload.color_index = defaultColorIndex

      // Create the appointment and request a single returned row to get a stable shape
      const { data: insertData, error: insertError } = await supabase.from('Appointment').insert(basePayload).select('id').single()
      if (insertError) {
        // If insert fails, surface the error
        console.error('Appointment insert error:', insertError)
        throw insertError
      }

      const createdId = (insertData as any)?.id
      if (!createdId) {
        console.error('Failed to determine created appointment id', insertData)
        throw new Error('Failed to determine created appointment id')
      }

      // If there are optional fields (proof_url, contract_url, recreators, bag, responsible), update the row
      const updates: any = {}
      if (proof_url) updates.proof_url = proof_url
      if (contract_url) updates.contract_url = contract_url
      if (selectedRecreatorIds && selectedRecreatorIds.length > 0) updates.recreator_ids = selectedRecreatorIds
      if (recreatorRequested && selectedRecreatorId) updates.recreatorid = selectedRecreatorId
      // requested_recreator_ids column removed in favor of join table
      if (selectedBagId) updates.bagid = selectedBagId
      if (responsibleRecreatorId) updates.responsible_recreatorid = responsibleRecreatorId
      // only set ownerpresent if true or false explicitly
      if (typeof ownerPresent !== 'undefined') updates.ownerpresent = ownerPresent

      if (Object.keys(updates).length > 0) {
        console.debug('Updating appointment', createdId, 'with optional fields', updates)
        // request the updated row back so we can inspect written columns immediately
  const { data: updatedRow, error: updateError } = await supabase.from('Appointment').update(updates).eq('id', createdId).select('id, proof_url, contract_url, recreator_ids, bagid, color_index').single()
        if (updateError) {
          // Log but don't block navigation — the appointment exists; user can edit later
          console.error('Failed to update appointment optional fields:', updateError)
        } else {
          console.debug('Updated appointment optional fields successfully ->', updatedRow)
        }
      } else {
        console.debug('No optional fields to update for appointment', createdId)
      }

      // Persist requested recreators in the join table (many-to-many)
      try {
        if (requestedRecreatorIds && requestedRecreatorIds.length > 0) {
          const rows = requestedRecreatorIds.map((rid) => ({ appointment_id: createdId, recreator_id: rid }))
          const { error: relError } = await supabase.from('AppointmentRequestedRecreator').insert(rows)
          if (relError) console.error('Failed to insert requested recreators relations:', relError)
        }
      } catch (err) {
        console.error('Error saving requested recreators relations:', err)
      }

      // --- RANKING: award points to selected recreators at creation time ---
      try {
        // New scoring rules requested:
        // - 1 point for every recreator present in the appointment (selectedRecreatorIds)
        // - If out of city -> everyone present gets +1 (but responsible gets no additional points)
        // - Each recreator requested by the mother gets +1 (but responsible gets no additional points)
        const POINTS_BASE = 1
        const POINTS_OUT_OF_CITY_BONUS = 1
        const POINTS_REQUESTED_BONUS = 1

        // Debugging: log selected/requested recreators and flags
        console.debug('RANKING: selectedRecreatorIds', selectedRecreatorIds, 'requestedRecreatorIds', requestedRecreatorIds, 'outofcity', outofcity, 'responsibleRecreatorId', responsibleRecreatorId)

        // Build the set of present recreator ids (selectedRecreatorIds)
        const chosenRecreatorIds = new Set<string>()
        if (Array.isArray(selectedRecreatorIds) && selectedRecreatorIds.length > 0) {
          selectedRecreatorIds.forEach((id) => chosenRecreatorIds.add(String(id)))
        }

        // It's possible the responsible recreator is considered separately; ensure we do not accidentally
        // grant them bonus points. We'll still award base points only if they also appear in the present list.
        const responsibleId = responsibleRecreatorId ? String(responsibleRecreatorId) : null

        const reqSet = new Set<string>()
        if (Array.isArray(requestedRecreatorIds) && requestedRecreatorIds.length > 0) {
          requestedRecreatorIds.forEach((id) => reqSet.add(String(id)))
        }

        // Exclude recreators marked as organizer from scoring entirely
        const ids = Array.from(chosenRecreatorIds).filter((rid) => {
          const found = recreators.find((r) => String(r.id ?? r.recreatorid) === String(rid))
          return !(found && (found as any).organizer === true)
        })
        if (ids.length > 0) {
          const rows = ids.map((rid) => {
            let points = POINTS_BASE

            // Add out-of-city bonus to everyone except the responsible recreator
            if (outofcity && String(rid) !== responsibleId) points += POINTS_OUT_OF_CITY_BONUS

            // Add requested-by-mother bonus if this recreator was requested (and is not the responsible)
            if (reqSet.has(String(rid)) && String(rid) !== responsibleId) points += POINTS_REQUESTED_BONUS

            return {
              recreatorid: rid,
              appointmentid: createdId,
              pointsawarded: points,
              createdat: new Date().toISOString(),
            }
          })

          // Debugging: show rows we will insert
          console.debug('RANKING: prepared rows for insert', { createdId, rows })

          // send rows to server endpoint that uses the service role key to insert (avoids RLS issues)
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
      // eslint-disable-next-line no-console
      console.error("Erro ao criar agendamento:", err)
      alert("Erro ao criar agendamento. Veja console para detalhes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4 text-center">Novo Agendamento</h1>

      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de validação</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 " />
              </div>
              <div>
                <Label>Hora</Label>
                <div className="relative mt-1">
                  <select
                    name="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full appearance-none bg-white border-2 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus transition-all shadow-sm"
                    required
                  >
                    <option value="" className="text-gray-400">Selecione o horário</option>
                    {Array.from({ length: 24 * 2 }).map((_, i) => {
                      const hour = Math.floor(i / 2)
                      const minute = i % 2 === 0 ? "00" : "30"
                      const value = `${hour.toString().padStart(2, "0")}:${minute}`
                      return <option key={value} value={value} className="text-amber-900 font-bold">{value}</option>
                    })}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Nome do evento</Label>
              <Input value={eventName} onChange={(e) => setEventName(e.target.value)} className="mt-1" placeholder="Ex: Festa de aniversário" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Duração (horas)</Label>
                <Input name="durationhours" type="number" min={1} value={String(durationhours)} onChange={(e) => setDurationHours(Number(e.target.value))} className="mt-1 w-full" />
              </div>
            </div>

            <div>
              <Label>Recreador responsável</Label>
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
                <SelectTrigger className="w-full" >
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
              <Label>Contratante</Label>
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
                <SelectTrigger className="w-full" >
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
              // Pessoa jurídica se documenttype for 'CNPJ'
              const isJuridica = selectedContractor && (String(selectedContractor.documenttype).toUpperCase() === 'CNPJ');
              if (isJuridica) return null;
              return (
                <div>
                  <Label>Nome da criança</Label>
                  <Input value={childname} onChange={(e) => setChildname(e.target.value)} className="mt-1 w-full" />
                </div>
              );
            })()}

            <div>
              <Label>Faixa etária da criança</Label>
              <Input value={childagegroup} onChange={(e) => setChildagegroup(e.target.value)} className="mt-1 w-full" placeholder="Ex: 3-5 anos" />
            </div>

            <div>
              <Label>Recreadores do evento</Label>
              <div className="mt-1 w-full border rounded px-2 py-2 h-40 overflow-auto bg-white">
                {recreators.map((r) => {
                  const id = String(r.id ?? r.recreatorid)
                  const checked = selectedRecreatorIds.includes(id)
                  return (
                    <div key={id} className="flex flex-row justify-evenly w-4 items-center gap-2 py-1">
                      <Checkbox checked={checked} onCheckedChange={() => {
                        setSelectedRecreatorIds((prev) =>
                          checked
                            ? prev.filter((rid) => rid !== id)
                            : [...prev, id]
                        );
                      }} className="shrink-0 w-4" />
                      <span className="select-none w-full">{r.name}</span>
                    </div>
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Marque os recreadores que estarão presentes no evento.</div>
            </div>

            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full" />
            </div>

            <div>
              <Label>Endereço do evento</Label>
              <Textarea value={eventaddress} onChange={(e) => setEventaddress(e.target.value)} className="mt-1 w-full" />
            </div>

            <div className="flex flex-row justify-evenly mr-28 sm:flex-row gap-4 items-center w-auto">
              <div className="flex items-center gap-2 w-4 mr-28">
                <Checkbox id="outofcity" checked={outofcity} onCheckedChange={(v: boolean) => setOutOfCity(Boolean(v))} className="shrink-0" />
                <Label htmlFor="outofcity" className="text-sm whitespace-nowrap">Fora da cidade</Label>
              </div>
              <div className="flex items-center gap-2 w-4 mr-10">
               
              </div>
            </div>

            <div>
              <Label>Mala</Label>
              <Select
                onValueChange={(v) => setSelectedBagId(v || null)}
                defaultValue={selectedBagId ?? ""}
              >
                <SelectTrigger className="w-full" >
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

            <div className="space-y-2 w-full">
              <Label>Comprovante (arquivo)</Label>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={(e) => { setProofFile(e.target.files?.[0] ?? null); setShowProofError(false) }}
                />
                <Button type="button" variant="outline" onClick={() => proofInputRef.current?.click()} className="w-full sm:w-auto">
                  Selecionar arquivo
                </Button>
                <div className="text-sm text-muted-foreground w-full sm:w-auto">
                  {proofFile ? proofFile.name : <span className="italic">Nenhum arquivo selecionado</span>}
                </div>
                {showProofError && (
                  <div className="text-sm text-red-600 w-full sm:w-auto">Comprovante obrigatório</div>
                )}
              </div>
            </div>

            {/* Creator name input only visible when user is not authenticated */}
            {isAuthenticated === false && (
              <div>
                <Label>Seu nome</Label>
                <Input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="mt-1 w-full" placeholder="Seu nome completo" />
                <div className="text-xs text-muted-foreground mt-1">Informe seu nome para registrar quem criou este agendamento.</div>
              </div>
            )}

            <div className="space-y-2 w-full">
              <Label>Contrato (PDF)</Label>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                <input
                  ref={contractInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => { setContractFile(e.target.files?.[0] ?? null); setShowContractError(false) }}
                />
                <Button type="button" variant="outline" onClick={() => contractInputRef.current?.click()} className="w-full sm:w-auto">
                  Selecionar PDF
                </Button>
                <div className="text-sm text-muted-foreground w-full sm:w-auto">
                  {contractFile ? contractFile.name : <span className="italic">Nenhum arquivo selecionado</span>}
                </div>
                {showContractError && (
                  <div className="text-sm text-red-600 w-full sm:w-auto">Contrato obrigatório</div>
                )}
              </div>
            </div>

            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2 w-4 sm:w-auto">
                <Checkbox checked={recreatorRequested} onCheckedChange={(v: boolean) => setRecreatorRequested(Boolean(v))} className="shrink-0" />
                <Label className="text-sm whitespace-nowrap">Possui recreador solicitado pela mãe?</Label>
              </div>
              {recreatorRequested && (
                <div className="mt-2 border rounded px-2 py-2 bg-white">
                  <Label className="block mb-2 text-sm">Selecione os recreadores solicitados:</Label>
                  {recreators.map((r) => {
                    const id = String(r.id ?? r.recreatorid);
                    const checked = requestedRecreatorIds.includes(id);
                    return (
                      <div key={id} className="flex items-center gap-2 py-1">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => {
                            setRequestedRecreatorIds((prev) =>
                              checked
                                ? prev.filter((rid) => rid !== id)
                                : [...prev, id]
                            );
                          }}
                          className="shrink-0 w-4"
                        />
                        <span className="select-none w-full">{r.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2 w-full">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? "Criando..." : "Criar Agendamento"}</Button>
              <Button variant="ghost" onClick={() => router.back()} className="w-full sm:w-auto">Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
