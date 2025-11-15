"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { uploadFileToBucket } from "@/utils/supabase/storage"

type Option = { id?: string; name?: string; [k: string]: any }

export default function NewAppointmentPage() {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [durationhours, setDurationHours] = useState<number>(1)
  const [childname, setChildname] = useState("")
  const [childagegroup, setChildagegroup] = useState("")
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

  const [proofFile, setProofFile] = useState<File | null>(null)
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [creatorName, setCreatorName] = useState<string>("")
  const [showProofError, setShowProofError] = useState(false)
  const [showContractError, setShowContractError] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [selectedBagId, setSelectedBagId] = useState<string | null>(null)

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
      if (!date || !time) {
        alert("Escolha data e hora")
        setLoading(false)
        return
      }
      if (!childname.trim()) {
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
        alert('Anexe o comprovante e o contrato obrigatoriamente')
        setLoading(false)
        return
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


  // find selected contractor to include contractorname (some schemas require it)
  const selectedContractor = contractors.find((c) => String(c.id ?? c.contractorid) === String(contractorId))

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

      // --- RANKING: award points to selected recreators at creation time ---
      // Assumption: award points based on duration (10 points per hour).
      // We only award at creation time using the selectedRecreatorIds captured here to
      // avoid double-awarding on later edits. If you prefer awarding on completion,
      // move this logic to the flow that marks the appointment as finished.
      try {
        // New scoring rules:
        // - If the appointment is out of city -> every recreator on the event gets 4 points
        // - Else if a specific recreator was requested by the mother -> that recreator gets 4 points, others get 2
        // - Otherwise -> each recreator gets 2 points
        const POINTS_OUT_OF_CITY = 4
        const POINTS_REQUESTED = 4
        const POINTS_DEFAULT = 2

        // Build a set of target recreator ids to award points to.
        const chosenRecreatorIds = new Set<string>()
        if (Array.isArray(selectedRecreatorIds) && selectedRecreatorIds.length > 0) {
          selectedRecreatorIds.forEach((id) => chosenRecreatorIds.add(id))
        }

        // If mother requested a specific recreator, ensure they're included
        if (recreatorRequested && selectedRecreatorId) {
          chosenRecreatorIds.add(selectedRecreatorId)
        }

        const ids = Array.from(chosenRecreatorIds)
        if (ids.length > 0) {
          const rows = ids.map((rid) => {
            let points = POINTS_DEFAULT
            if (outofcity) points = POINTS_OUT_OF_CITY
            else if (recreatorRequested && selectedRecreatorId && String(rid) === String(selectedRecreatorId)) points = POINTS_REQUESTED

            return {
              recreatorid: rid,
              appointmentid: createdId,
              pointsawarded: points,
              createdat: new Date().toISOString(),
            }
          })

          // batch insert into RankingEventDetail (RLS must allow insert from authenticated users)
          const { error: rankError } = await supabase.from('RankingEventDetail').insert(rows)
          if (rankError) {
            console.warn('Failed to insert ranking rows for appointment', createdId, rankError)
          } else {
            console.debug('Inserted ranking rows for appointment', createdId, rows.length, rows)
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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo Agendamento</h1>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Hora</Label>
                <Input name="time" type="time" step={1800} value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-36" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duração (horas)</Label>
                <Input name="durationhours" type="number" min={1} value={String(durationhours)} onChange={(e) => setDurationHours(Number(e.target.value))} className="mt-1 w-36" />
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
                <SelectTrigger>
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
                <SelectTrigger>
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

            <div>
              <Label>Nome da criança</Label>
              <Input value={childname} onChange={(e) => setChildname(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Faixa etária da criança</Label>
              <Input value={childagegroup} onChange={(e) => setChildagegroup(e.target.value)} className="mt-1" placeholder="Ex: 3-5 anos" />
            </div>

            <div>
              <Label>Recreadores do evento</Label>
              <div className="mt-1 w-full border rounded px-2 py-2 h-40 overflow-auto">
                {recreators.map((r) => {
                  const id = String(r.id ?? r.recreatorid)
                  const checked = selectedRecreatorIds.includes(id)
                  return (
                    <div key={id} className="flex items-center gap-2 py-1">
                      <Checkbox checked={checked} onCheckedChange={() => toggleRecreatorSelection(id)} />
                      <span className="select-none">{r.name}</span>
                    </div>
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Marque os recreadores que estarão presentes no evento.</div>
            </div>

            <div>
              <Label>Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Endereço do evento</Label>
              <Textarea value={eventaddress} onChange={(e) => setEventaddress(e.target.value)} className="mt-1" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="outofcity" checked={outofcity} onCheckedChange={(v: boolean) => setOutOfCity(Boolean(v))} />
                <Label htmlFor="outofcity" className="text-sm">Fora da cidade</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ownerpresent" checked={ownerPresent} onCheckedChange={(v: boolean) => setOwnerPresent(Boolean(v))} />
                <Label htmlFor="ownerpresent" className="text-sm">Dono presente no evento?</Label>
              </div>
            </div>

            <div>
              <Label>Mala</Label>
              <Select
                onValueChange={(v) => setSelectedBagId(v || null)}
                defaultValue={selectedBagId ?? ""}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label>Comprovante (arquivo)</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                     onChange={(e) => { setProofFile(e.target.files?.[0] ?? null); setShowProofError(false) }}
                required/>
                <Button type="button" variant="outline" onClick={() => proofInputRef.current?.click()}>
                  Selecionar arquivo
                </Button>
                <div className="text-sm text-muted-foreground">
                  {proofFile ? proofFile.name : <span className="italic">Nenhum arquivo selecionado</span>}
                </div>
                {showProofError && (
                  <div className="text-sm text-red-600">Comprovante obrigatório</div>
                )}
              </div>
            </div>

            {/* Creator name input only visible when user is not authenticated */}
            {isAuthenticated === false && (
              <div>
                <Label>Seu nome</Label>
                <Input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="mt-1" placeholder="Seu nome completo" />
                <div className="text-xs text-muted-foreground mt-1">Informe seu nome para registrar quem criou este agendamento.</div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Contrato (PDF)</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={contractInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                     onChange={(e) => { setContractFile(e.target.files?.[0] ?? null); setShowContractError(false) }}
                required/>
                <Button type="button" variant="outline" onClick={() => contractInputRef.current?.click()}>
                  Selecionar PDF
                </Button>
                <div className="text-sm text-muted-foreground">
                  {contractFile ? contractFile.name : <span className="italic">Nenhum arquivo selecionado</span>}
                </div>
                {showContractError && (
                  <div className="text-sm text-red-600">Contrato obrigatório</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={recreatorRequested} onCheckedChange={(v: boolean) => setRecreatorRequested(Boolean(v))} />
                <Label className="text-sm">Possui recreador solicitado pela mãe?</Label>
              </div>
                {recreatorRequested && (
                <Select
                  onValueChange={(v) => {
                    const val = v || null
                    setSelectedRecreatorId(val)
                    const found = recreators.find((x) => String(x.id ?? x.recreatorid) === val)
                    if (found) {
                      setPhone(found.phone ?? "")
                    }
                  }}
                  defaultValue={selectedRecreatorId ?? ""}
                >
                  <SelectTrigger>
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
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar Agendamento"}</Button>
              <Button variant="ghost" onClick={() => router.back()} className="">Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
