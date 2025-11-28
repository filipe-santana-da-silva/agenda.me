"use client"

import { useEffect, useState, useRef } from 'react'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppointmentWithService } from './appointment-list'
import { format } from 'date-fns'
import { formatCurrancy } from '@/utils/formatCurrency'
import { createClient } from '@/utils/supabase/client'
import { uploadFileToBucket } from '@/utils/supabase/storage'
import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
 
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, AlertCircle } from 'lucide-react'

interface DialogAppointmentProps {
  appointment: AppointmentWithService | null
  startEditing?: boolean
}

export function DialogAppointment({ appointment, startEditing }: DialogAppointmentProps) {
  // Always render DialogContent to keep the component tree stable between
  // server and client renders. Rendering nothing here when the dialog root
  // is present can cause React/Next to complain about missing static flags
  // when the portal/content is mounted asynchronously.
  const ap = appointment ?? null
    const formattedDate = ap ? format(new Date(ap.appointmentdate), 'dd/MM/yyyy') : ''
    const formattedPrice = ap ? formatCurrancy((ap.service?.price ?? 0) / 100) : ''

  const [recreatorNames, setRecreatorNames] = useState<string[]>([])
  const [recreatorIds, setRecreatorIds] = useState<string[]>([])
  const [requestedRecreatorNames, setRequestedRecreatorNames] = useState<string[]>([])
  const [requestedRecreatorIds, setRequestedRecreatorIds] = useState<string[]>([])
  const [responsibleName, setResponsibleName] = useState<string | null>(null)
  const [bagName, setBagName] = useState<string | null>(null)
  const [creatorDisplayName, setCreatorDisplayName] = useState<string | null>(ap?.created_by ?? null)
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null)
  const [contractPreviewUrl, setContractPreviewUrl] = useState<string | null>(null)
  const [showProofPreview, setShowProofPreview] = useState(false)
  const [showContractPreview, setShowContractPreview] = useState(false)
  const [uploadingProof, setUploadingProof] = useState(false)
  const [uploadingContract, setUploadingContract] = useState(false)
  const proofInputRef = useRef<HTMLInputElement | null>(null)
  const contractInputRef = useRef<HTMLInputElement | null>(null)
  const [eventName, setEventName] = useState<string | null>(ap?.eventname ?? null)
  const [editingEventName, setEditingEventName] = useState(false)
  const [savingEventName, setSavingEventName] = useState(false)
  const [editingMode, setEditingMode] = useState(false)

  // editable copy of fields for full edit mode
  const [editable, setEditable] = useState<any>({
    eventname: ap?.eventname ?? null,
    childname: ap?.childname ?? null,
    childagegroup: ap?.childagegroup ?? null,
    phone: ap?.phone ?? null,
    email: ap?.email ?? null,
    eventaddress: ap?.eventaddress ?? null,
    address: ap?.address ?? null,
    outofcity: ap?.outofcity ?? false,
    ownerpresent: ap?.ownerpresent ?? false,
    durationhours: ap?.durationhours ?? 1,
    recreatorscount: typeof ap?.recreatorscount === 'undefined' ? null : ap?.recreatorscount ?? null,
    // currency fields stored as integer cents in DB; editable keeps string in reais for user input
    valor_pago: typeof ap?.valor_pago === 'undefined' ? null : (ap?.valor_pago != null ? String(Number(ap.valor_pago) / 100) : null),
    valor_a_pagar: typeof ap?.valor_a_pagar === 'undefined' ? null : (ap?.valor_a_pagar != null ? String(Number(ap.valor_a_pagar) / 100) : null),
    created_by: ap?.created_by ?? null,
    requestedbymother: typeof ap?.requestedbymother !== 'undefined' ? ap.requestedbymother : false,
    bagid: ap?.bagid ?? null,
    responsible_recreatorid: ap?.responsible_recreatorid ?? null,
    recreator_ids: Array.isArray(ap?.recreator_ids) ? ap?.recreator_ids : (ap?.recreator_ids ? [ap.recreator_ids] : []),
    requested_recreator_ids: []
  })

  // lists for select controls
  const [recreatorsList, setRecreatorsList] = useState<Array<{ id: string; name: string }>>([])
  const [bagsList, setBagsList] = useState<Array<{ id: string; number?: string }>>([])

  useEffect(() => {
    setEventName(ap?.eventname ?? null)
    setEditable((prev: any) => ({
      ...prev,
      eventname: ap?.eventname ?? null,
      childname: ap?.childname ?? null,
      childagegroup: ap?.childagegroup ?? null,
      phone: ap?.phone ?? null,
      email: ap?.email ?? null,
      eventaddress: ap?.eventaddress ?? null,
      address: ap?.address ?? null,
      outofcity: ap?.outofcity ?? false,
      ownerpresent: ap?.ownerpresent ?? false,
      durationhours: ap?.durationhours ?? 1,
      recreatorscount: typeof ap?.recreatorscount === 'undefined' ? null : ap?.recreatorscount ?? null,
      valor_pago: typeof ap?.valor_pago === 'undefined' ? null : (ap?.valor_pago != null ? String(Number(ap.valor_pago) / 100) : null),
      valor_a_pagar: typeof ap?.valor_a_pagar === 'undefined' ? null : (ap?.valor_a_pagar != null ? String(Number(ap.valor_a_pagar) / 100) : null),
      created_by: ap?.created_by ?? null,
      recreator_ids: Array.isArray(ap?.recreator_ids) ? ap?.recreator_ids : (ap?.recreator_ids ? [ap.recreator_ids] : []),
      requested_recreator_ids: [],
    }))
  }, [ap])

  useEffect(() => {
    if (startEditing) setEditingMode(true)
  }, [startEditing])

  useEffect(() => {
    let mounted = true
    async function loadRelated() {
      try {
        const supabase = createClient()
        const ids: string[] = []
        if (ap) {
          if (Array.isArray(ap.recreator_ids)) {
            for (const r of ap.recreator_ids) ids.push(String(r))
          } else if (ap.recreator_ids) {
            // single id stored as string -> normalize to array
            ids.push(String(ap.recreator_ids))
          }
          if (ap.recreatorid) ids.push(String(ap.recreatorid))
        }

        if (ids.length > 0) {
          const { data, error } = await supabase.from('Recreator').select('id, name').in('id', ids)
          if (!error && data) {
            if (!mounted) return
            const map = new Map<string, string>()
            data.forEach((d: any) => map.set(String(d.id), d.name ?? String(d.id)))
            const names = ids.map((id) => map.get(String(id)) ?? id)
            setRecreatorIds(ids)
            setRecreatorNames(names)
          }
        }

        // responsible recreator
        if (ap && ap.responsible_recreatorid) {
          const { data, error } = await supabase.from('Recreator').select('id, name').eq('id', ap.responsible_recreatorid).single()
          if (!error && data && mounted) setResponsibleName(data.name ?? String(data.id))
        }

        // bag name
        if (ap && ap.bagid) {
          const { data, error } = await supabase.from('Bag').select('id, number').eq('id', ap.bagid).single()
          if (!error && data && mounted) setBagName(data.number ? `Mala ${data.number}` : String(data.id))
        }
        // signed-url previews
        try {
          if (ap && ap.proof_url) {
            const r = await fetch('/api/uploads/signed-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: ap.proof_url, expires: 120 }) })
            if (r.ok) {
              const jb = await r.json()
              // keep a visible fallback to the original URL if signed-url isn't available
              if (mounted) setProofPreviewUrl(jb.signedUrl ?? ap.proof_url)
            } else {
              if (mounted) setProofPreviewUrl(ap.proof_url)
            }
          }
        } catch (e) {
          if (mounted) setProofPreviewUrl(ap?.proof_url ?? null)
        }

        try {
          if (ap && ap.contract_url) {
            const r2 = await fetch('/api/uploads/signed-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: ap.contract_url, expires: 120 }) })
            if (r2.ok) {
              const jb2 = await r2.json()
              if (mounted) setContractPreviewUrl(jb2.signedUrl ?? ap.contract_url)
            } else {
              if (mounted) setContractPreviewUrl(ap.contract_url)
            }
          }
        } catch (e) {
          if (mounted) setContractPreviewUrl(ap?.contract_url ?? null)
        }

        // Creator display name: prefer User.name (profile) when appointment.userid is present,
        // otherwise prefer appointment.created_by, else null.
        try {
          if (ap?.userid) {
            const { data: profile, error: profileError } = await supabase.from('User').select('name').eq('id', ap.userid).maybeSingle()
            if (!profileError && profile && (profile as any).name) {
              if (mounted) setCreatorDisplayName((profile as any).name)
            } else if (ap?.created_by) {
              if (mounted) setCreatorDisplayName(String(ap.created_by))
            } else {
              if (mounted) setCreatorDisplayName(null)
            }
          } else if (ap?.created_by) {
            if (mounted) setCreatorDisplayName(String(ap.created_by))
          } else {
            if (mounted) setCreatorDisplayName(null)
          }
        } catch (e) {
          if (mounted) setCreatorDisplayName(ap?.created_by ?? null)
        }
        // Also fetch lists used for editing controls
        try {
          const { data: allRecreators } = await supabase.from('Recreator').select('id, name').order('name', { ascending: true })
          if (mounted && Array.isArray(allRecreators)) setRecreatorsList(allRecreators.map((r: any) => ({ id: String(r.id), name: r.name ?? String(r.id) })))
          // if there are requested recreators stored in join table, fetch them
          try {
            if (ap) {
              const { data: reqRows } = await supabase.from('AppointmentRequestedRecreator').select('recreator_id').eq('appointment_id', ap.id)
              if (mounted && Array.isArray(reqRows)) {
                const reqIds = reqRows.map((r: any) => String(r.recreator_id))
                // set editable requested ids for edit controls
                setEditable((p: any) => ({ ...p, requested_recreator_ids: reqIds }))
                // track requested ids separately so we can display them alongside present recreators
                setRequestedRecreatorIds(reqIds)
                if (reqIds.length > 0) {
                  const { data: reqNames } = await supabase.from('Recreator').select('id, name').in('id', reqIds)
                  if (mounted && Array.isArray(reqNames)) {
                    const map = new Map<string, string>()
                    reqNames.forEach((r: any) => map.set(String(r.id), r.name ?? String(r.id)))
                    const names = reqIds.map((id) => map.get(id) ?? id)
                    setRequestedRecreatorNames(names)
                  }
                } else {
                  setRequestedRecreatorNames([])
                }
              }
            }
          } catch (e) {
            // ignore
          }
        } catch (e) {
          // ignore
        }

        try {
          const { data: allBags } = await supabase.from('Bag').select('id, number').order('number', { ascending: true })
          if (mounted && Array.isArray(allBags)) setBagsList(allBags.map((b: any) => ({ id: String(b.id), number: b.number })))
        } catch (e) {
          // ignore
        }

      } catch (err) {
        // ignore
      }
    }
    loadRelated()
    return () => {
      mounted = false
    }
  }, [appointment])


  const isImage = (url?: string | null) => /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(String(url ?? ''))
  const isPdf = (url?: string | null) => /\.pdf(\?|#|$)/i.test(String(url ?? ''))

  // Save edited appointment fields
  async function handleSaveEdits() {
    if (!ap) return
    
    // Validar se comprovante e contrato estão presentes
    if (!proofPreviewUrl && !ap?.proof_url) {
      toast.error('Comprovante é obrigatório! Por favor, envie um comprovante.')
      return
    }
    if (!contractPreviewUrl && !ap?.contract_url) {
      toast.error('Contrato é obrigatório! Por favor, envie um contrato.')
      return
    }
    
    const supabase = createClient()
    const updates: any = {
      eventname: editable.eventname ?? null,
      childname: editable.childname ?? (ap?.childname ?? ''),
      // childagegroup is NOT NULL in the DB schema — ensure we send a non-null value
      childagegroup: editable.childagegroup ?? (ap?.childagegroup ?? ''),
      phone: editable.phone ?? null,
      email: editable.email ?? null,
      eventaddress: editable.eventaddress ?? null,
      address: editable.address ?? null,
      outofcity: Boolean(editable.outofcity),
      ownerpresent: Boolean(editable.ownerpresent),
      durationhours: Number(editable.durationhours) || 1,
      recreatorscount: (editable.recreatorscount === null || editable.recreatorscount === '') ? null : Math.max(0, Number(editable.recreatorscount) || 0),
      valor_pago: (editable.valor_pago === null || editable.valor_pago === '') ? null : Math.round(Number(editable.valor_pago) * 100),
      valor_a_pagar: (editable.valor_a_pagar === null || editable.valor_a_pagar === '') ? null : Math.round(Number(editable.valor_a_pagar) * 100),
      created_by: editable.created_by ?? null,
      requestedbymother: Boolean(editable.requestedbymother),
      bagid: editable.bagid ?? null,
      responsible_recreatorid: editable.responsible_recreatorid ?? null,
      recreator_ids: Array.isArray(editable.recreator_ids) ? editable.recreator_ids : (editable.recreator_ids ? [editable.recreator_ids] : []),
    }
    try {
      const { error } = await supabase.from('Appointment').update(updates).eq('id', ap.id)
      if (error) {
        console.error('Failed to save appointment edits', error)
        toast.error('Falha ao salvar alterações')
        return
      }
      // After updating appointment row, persist requested recreator relations
      try {
        // remove existing relations
        const { error: delErr } = await supabase.from('AppointmentRequestedRecreator').delete().eq('appointment_id', ap.id)
        if (delErr) console.error('Failed to delete old requested recreator relations', delErr)
        // insert new relations from editable.requested_recreator_ids
        const reqIds = Array.isArray(editable.requested_recreator_ids) ? editable.requested_recreator_ids : []
        if (reqIds.length > 0) {
          const rows = reqIds.map((rid: string) => ({ appointment_id: ap.id, recreator_id: rid }))
          const { error: insErr } = await supabase.from('AppointmentRequestedRecreator').insert(rows)
          if (insErr) console.error('Failed to insert requested recreator relations', insErr)
        }
      } catch (e) {
        console.error('Error persisting requested recreators relations', e)
      }

      // Recalculate ranking points for this appointment based on updated present recreators
      try {
        // Always remove existing ranking rows for this appointment and re-insert per current rules
        const responsibleId = editable.responsible_recreatorid ?? ap.responsible_recreatorid ?? null

        // present recreators from editable state
        const presentIds: string[] = Array.isArray(editable.recreator_ids) ? editable.recreator_ids.map(String) : []
        const reqIds: string[] = Array.isArray(editable.requested_recreator_ids) ? editable.requested_recreator_ids.map(String) : []

        try {
          // Use server endpoint to delete old rows and insert new ones with service role
          // fetch organizer flags to exclude organizers from scoring
          const { data: recs, error: recErr } = await supabase.from('Recreator').select('id, organizer').in('id', presentIds)
          if (recErr) {
            console.warn('Failed to fetch recreator organizer flags', recErr)
          }

          const organizerSet = new Set<string>()
          if (Array.isArray(recs)) recs.forEach((r: any) => { if (r.organizer) organizerSet.add(String(r.id)) })

          const POINTS_BASE = 1
          const POINTS_OUT_OF_CITY_BONUS = 1
          const POINTS_REQUESTED_BONUS = 1

          const rows = presentIds
            .filter((id) => !organizerSet.has(String(id)))
            .map((rid) => {
              let points = POINTS_BASE
              if (Boolean(editable.outofcity)) points += POINTS_OUT_OF_CITY_BONUS
              if (reqIds.includes(String(rid))) points += POINTS_REQUESTED_BONUS
              return {
                recreatorid: rid,
                appointmentid: ap.id,
                pointsawarded: points,
                createdat: new Date().toISOString(),
              }
            })

          if (rows.length > 0) {
            try {
              const res = await fetch('/api/appointments/ranking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleteAppointmentId: ap.id, rows }),
              })
              const json = await res.json()
              if (!res.ok) {
                console.warn('Failed to insert ranking rows after edit (server):', json)
              } else {
                console.debug('Inserted ranking rows after edit (server)', ap.id, json.inserted ?? 0)
              }
            } catch (err) {
              console.error('Failed to call ranking endpoint after edit', err)
            }
          } else {
            // still delete old rows if there are none to insert
            try {
              await fetch('/api/appointments/ranking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleteAppointmentId: ap.id, rows: [] }),
              })
            } catch (err) {
              console.error('Failed to call ranking delete endpoint after edit', err)
            }
          }
        } catch (e) {
          console.error('Error while recalculating ranking on edit:', e)
        }
      } catch (e) {
        console.error('Error while recalculating ranking on edit:', e)
      }

      toast.success('Alterações salvas')
      setEditingMode(false)
    } catch (e) {
      console.error('Save error', e)
      toast.error('Erro ao salvar alterações')
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Detalhes do agendamento</DialogTitle>
        <DialogDescription>Veja todos os detalhes do agendamento</DialogDescription>
      </DialogHeader>
      <ScrollArea className="max-h-[60vh] pr-2">
        <div className="py-4 space-y-2 text-sm relative">
        {!ap && (
          <div className="text-sm text-muted-foreground">Selecione um agendamento para ver detalhes.</div>
        )}
          {ap && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  {/* Event name field placed above other fields */}
                  <div className="mb-2">
                    <label className="text-sm font-semibold block">Nome do evento:</label>
                    {(editingEventName || editingMode) ? (
                      <div className="flex items-center gap-2">
                        <input className="border rounded px-2 py-1 text-sm" value={eventName ?? ''} onChange={(e) => setEventName(e.target.value)} />
                        <Button size="sm" onClick={async () => {
                          if (!ap) return
                          try {
                            setSavingEventName(true)
                            const supabase = createClient()
                            const { error } = await supabase.from('Appointment').update({ eventname: eventName ?? '' }).eq('id', ap.id)
                              if (error) {
                                console.error('Failed to save event name', error)
                                toast.error('Falha ao salvar nome do evento')
                              } else {
                                setEditingEventName(false)
                                toast.success('Nome do evento salvo')
                              }
                              // refresh displayed creator name from appointment data
                              if (ap?.created_by) setCreatorDisplayName(String(ap.created_by))
                          } finally {
                            setSavingEventName(false)
                          }
                        }} disabled={savingEventName}>{savingEventName ? 'Salvando...' : 'Salvar'}</Button>
                        <Button variant="ghost" onClick={() => { setEditingEventName(false); setEventName(ap?.eventname ?? null) }}>Cancelar</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">{eventName ?? <span className="text-muted-foreground">(sem nome)</span>}</div>
                      </div>
                    )}
                  </div>
                  <span className='font-semibold'>Contratante: </span>
                  <div className="text-lg font-semibold">{ap.contractorname}</div>
                  <span className="font-semibold">Criança: </span>
                  <div className="text-sm text-muted-foreground">
                    {editingMode ? (
                      <input className="border rounded px-2 py-1 text-sm" value={editable.childname ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, childname: e.target.value }))} />
                    ) : (
                      ap.childname
                    )}
                  </div>
                </div>
                <div className="text-sm text-right mr-5">
                  {ap.time}
                  <div>{formattedDate}</div>
                  <div>Duração: {ap.durationhours ?? 1}h</div>
                </div>
              </div>

              <p>
                <span className="font-semibold">Telefone: </span> {ap.phone}
              </p>

              {(ap.childagegroup || editingMode) && (
                  <div>
                    <p className="text-sm font-semibold">Faixa etária da criança*: </p>
                    <div className="text-sm text-muted-foreground">
                      {editingMode ? (
                        <input className="border rounded px-2 py-1 text-sm" value={editable.childagegroup ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, childagegroup: e.target.value }))} />
                      ) : (
                        ap.childagegroup
                      )}
                    </div>
                  </div>
              )}

              {/* recreators count was moved below responsible recreator for layout */}

              <p>
                <span className="font-semibold">Email: </span>
                {editingMode ? (
                  <input className="border rounded px-2 py-1 ml-2 text-sm" value={editable.email ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, email: e.target.value }))} />
                ) : (
                  ap.email
                )}
              </p>

              {ap.eventaddress && (
                <p>
                  <span className="font-semibold">Endereço do evento: </span>
                  {editingMode ? (
                    <input className="border rounded px-2 py-1 ml-2 text-sm" value={editable.eventaddress ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, eventaddress: e.target.value }))} />
                  ) : (
                    ap.eventaddress
                  )}
                </p>
              )}

              {ap.address && (
                <p>
                  <span className="font-semibold">Endereço do contratante: </span>
                  {editingMode ? (
                    <input className="border rounded px-2 py-1 ml-2 text-sm" value={editable.address ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, address: e.target.value }))} />
                  ) : (
                    ap.address
                  )}
                </p>
              )}

              <p>
                <span className="font-semibold">Fora da cidade: </span>
                {editingMode ? (
                  <input type="checkbox" className="ml-2" checked={Boolean(editable.outofcity)} onChange={(e) => setEditable((p: any) => ({ ...p, outofcity: e.target.checked }))} />
                ) : (
                  (String(ap.outofcity) === 'true' || ap.outofcity) ? ' Sim' : ' Não'
                )}
              </p>

              {typeof ap.requestedbymother !== 'undefined' && (
                <p>
                  <span className="font-semibold">Recreador solicitado pela mãe: </span>
                  {editingMode ? (
                    <input type="checkbox" className="ml-2" checked={Boolean(editable.requestedbymother)} onChange={(e) => setEditable((p: any) => ({ ...p, requestedbymother: e.target.checked }))} />
                  ) : (
                    ap.requestedbymother ? ' Sim' : ' Não'
                  )}
                </p>
              )}

              {/* 'Dono presente' field removed from dialog as requested */}

              <p>
                <span className="font-semibold">Mala: </span>
                {editingMode ? (
                  <Select onValueChange={(v) => setEditable((p: any) => ({ ...p, bagid: v || null }))} defaultValue={editable.bagid ?? ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="-- escolha --" />
                    </SelectTrigger>
                    <SelectContent>
                      {bagsList.map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>{b.number ? `Mala ${b.number}` : b.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  bagName ?? ''
                )}
              </p>

              {/* Valores: valor pago / valor a pagar (reais) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-semibold mb-1">Valor pago:</p>
                  {editingMode ? (
                    <input type="number" step="0.01" min="0" className="border rounded px-2 py-1 ml-0 text-sm w-full" value={editable.valor_pago ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, valor_pago: e.target.value === '' ? null : e.target.value }))} />
                  ) : (
                    <div className="text-sm text-muted-foreground">{(typeof ap?.valor_pago === 'undefined' || ap?.valor_pago === null) ? '(nenhum)' : formatCurrancy((ap.valor_pago ?? 0) / 100)}</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Valor a pagar:</p>
                  {editingMode ? (
                    <input type="number" step="0.01" min="0" className="border rounded px-2 py-1 ml-0 text-sm w-full" value={editable.valor_a_pagar ?? ''} onChange={(e) => setEditable((p: any) => ({ ...p, valor_a_pagar: e.target.value === '' ? null : e.target.value }))} />
                  ) : (
                    <div className="text-sm text-muted-foreground">{(typeof ap?.valor_a_pagar === 'undefined' || ap?.valor_a_pagar === null) ? '(nenhum)' : formatCurrancy((ap.valor_a_pagar ?? 0) / 100)}</div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-sm font-semibold mb-2">Recreador responsável:</p>
                  {editingMode ? (
                    <Select onValueChange={(v) => setEditable((p: any) => ({ ...p, responsible_recreatorid: v || null }))} defaultValue={editable.responsible_recreatorid ?? ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="-- escolha --" />
                      </SelectTrigger>
                      <SelectContent>
                        {recreatorsList.map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground">{responsibleName ?? '(nenhum)'}</div>
                  )}
                </div>

                  {/* Quantidade de recreadores: placed directly under responsible recreator */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Quantidade de recreadores:</p>
                    {editingMode ? (
                      <input
                        type="number"
                        min="0"
                        className="border rounded px-2 py-1 ml-0 text-sm w-28"
                        value={editable.recreatorscount === null ? '' : String(editable.recreatorscount)}
                        onChange={(e) => setEditable((p: any) => ({ ...p, recreatorscount: e.target.value === '' ? null : e.target.value }))}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">{(typeof ap?.recreatorscount === 'undefined' || ap?.recreatorscount === null) ? '(nenhum)' : String(ap.recreatorscount)}</div>
                    )}
                  </div>

                <div>
                    <p className="text-sm font-semibold mb-2">Recreadores presentes:</p>
                    {editingMode ? (
                      <div className="w-full border rounded px-2 py-2 h-40 overflow-auto">
                        {recreatorsList.map((r) => {
                          const id = String(r.id)
                          const checked = (Array.isArray(editable.recreator_ids) && editable.recreator_ids.includes(id)) || (Array.isArray(editable.requested_recreator_ids) && editable.requested_recreator_ids.includes(id))
                          return (
                            <div key={id} className="flex items-center gap-2 py-1">
                              <input type="checkbox" checked={checked} onChange={() => {
                                setEditable((p: any) => {
                                  const prev = Array.isArray(p.recreator_ids) ? [...p.recreator_ids] : []
                                  if (prev.includes(id)) return { ...p, recreator_ids: prev.filter((x) => x !== id) }
                                  return { ...p, recreator_ids: [...prev, id] }
                                })
                              }} />
                              <span className="select-none">{r.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {(() => {
                          const pairs: Array<{ id: string; name: string }> = []
                          const seen = new Set<string>()
                          for (let i = 0; i < recreatorIds.length; i++) {
                            const id = recreatorIds[i]
                            const name = recreatorNames[i] ?? id
                            if (!seen.has(id)) {
                              seen.add(id)
                              pairs.push({ id, name })
                            }
                          }
                          for (let i = 0; i < requestedRecreatorIds.length; i++) {
                            const id = requestedRecreatorIds[i]
                            const name = requestedRecreatorNames[i] ?? id
                            if (!seen.has(id)) {
                              seen.add(id)
                              pairs.push({ id, name })
                            }
                          }
                          return (pairs.map(p => p.name).join(', ') || '(nenhum)')
                        })()}
                      </div>
                    )}
                  </div>

                  {/** requested recreators editing block */}
                  <div>
                    <p className="text-sm font-semibold mb-2">Recreadores solicitados pela mãe:</p>
                    {editingMode ? (
                      <div className="w-full border rounded px-2 py-2 h-40 overflow-auto">
                        {recreatorsList.map((r) => {
                          const id = String(r.id)
                          const checked = Array.isArray(editable.requested_recreator_ids) && editable.requested_recreator_ids.includes(id)
                          return (
                            <div key={`req-${id}`} className="flex items-center gap-2 py-1">
                              <input type="checkbox" checked={checked} onChange={() => {
                                setEditable((p: any) => {
                                  const prev = Array.isArray(p.requested_recreator_ids) ? [...p.requested_recreator_ids] : []
                                  if (prev.includes(id)) return { ...p, requested_recreator_ids: prev.filter((x) => x !== id) }
                                  return { ...p, requested_recreator_ids: [...prev, id] }
                                })
                              }} />
                              <span className="select-none">{r.name}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">{requestedRecreatorNames.join(', ') || '(nenhum)'}</div>
                    )}
                  </div>

                
              </div>

              {/* Alerta de documentos obrigatórios */}
              {(!proofPreviewUrl && !ap?.proof_url) || (!contractPreviewUrl && !ap?.contract_url) ? (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Documentos obrigatórios:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {!proofPreviewUrl && !ap?.proof_url && <li>Comprovante é obrigatório</li>}
                      {!contractPreviewUrl && !ap?.contract_url && <li>Contrato é obrigatório</li>}
                    </ul>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Comprovante:</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowProofPreview((s) => !s)}
                    disabled={!proofPreviewUrl && !ap?.proof_url}
                    title={proofPreviewUrl ?? ap?.proof_url ? 'Mostrar comprovante' : 'Nenhum comprovante anexado'}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <input ref={proofInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f || !ap) return
                    try {
                      setUploadingProof(true)
                      const url = await uploadFileToBucket('appointments', f)
                      // Update appointment row with new proof_url
                      const supabase = createClient()
                      const { error } = await supabase.from('Appointment').update({ proof_url: url }).eq('id', ap.id)
                      if (error) {
                        console.error('Failed to update proof_url', error)
                        toast.error('Falha ao atualizar comprovante. Veja console para detalhes.')
                      } else {
                        setProofPreviewUrl(url)
                        setShowProofPreview(true)
                        toast.success('Comprovante enviado com sucesso')
                      }
                    } catch (err) {
                      console.error('Upload error', err)
                      toast.error('Falha ao enviar comprovante')
                    } finally {
                      setUploadingProof(false)
                      // reset input to allow re-uploading same file name
                      if (proofInputRef.current) proofInputRef.current.value = ''
                    }
                  }} />
                  {editingMode && (
                    <div className="text-xs text-muted-foreground ml-2">Você pode subir um novo comprovante ao editar.</div>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => proofInputRef.current?.click()} disabled={uploadingProof} title="Subir novo comprovante">
                    <UploadCloud className="w-4 h-4" />
                  </Button>
                  { (proofPreviewUrl || ap?.proof_url) ? (
                    <div className="text-sm text-muted-foreground">Visualização abaixo</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum comprovante anexado.</div>
                  )}
                </div>

                {showProofPreview && (proofPreviewUrl ?? ap?.proof_url) && (
                  <div className="mt-2 border rounded p-2">
                    {isImage(proofPreviewUrl ?? ap?.proof_url) ? (
                      // image preview
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(proofPreviewUrl ?? ap?.proof_url) as string} alt="comprovante" className="max-h-80 w-auto mx-auto" />
                    ) : (
                      // pdf or other: embed with iframe
                      <iframe src={(proofPreviewUrl ?? ap?.proof_url) as string} className="w-full h-96" title="comprovante" />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Contrato:</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContractPreview((s) => !s)}
                    disabled={!contractPreviewUrl && !ap?.contract_url}
                    title={contractPreviewUrl ?? ap?.contract_url ? 'Mostrar contrato' : 'Nenhum contrato anexado'}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <input ref={contractInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f || !ap) return
                    try {
                      setUploadingContract(true)
                      const url = await uploadFileToBucket('appointments', f)
                      const supabase = createClient()
                      const { error } = await supabase.from('Appointment').update({ contract_url: url }).eq('id', ap.id)
                      if (error) {
                        console.error('Failed to update contract_url', error)
                        toast.error('Falha ao atualizar contrato. Veja console para detalhes.')
                      } else {
                        setContractPreviewUrl(url)
                        setShowContractPreview(true)
                        toast.success('Contrato enviado com sucesso')
                      }
                    } catch (err) {
                      console.error('Upload error', err)
                      toast.error('Falha ao enviar contrato')
                    } finally {
                      setUploadingContract(false)
                      if (contractInputRef.current) contractInputRef.current.value = ''
                    }
                  }} />
                  {editingMode && (
                    <div className="text-xs text-muted-foreground ml-2">Você pode subir um novo contrato ao editar.</div>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => contractInputRef.current?.click()} disabled={uploadingContract} title="Subir novo contrato">
                    <UploadCloud className="w-4 h-4" />
                  </Button>
                  { (contractPreviewUrl || ap?.contract_url) ? (
                    <div className="text-sm text-muted-foreground">Visualização abaixo</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nenhum contrato anexado.</div>
                  )}
                </div>

                {showContractPreview && (contractPreviewUrl ?? ap?.contract_url) && (
                  <div className="mt-2 border rounded p-2">
                    {isPdf(contractPreviewUrl ?? ap?.contract_url) ? (
                      <iframe src={(contractPreviewUrl ?? ap?.contract_url) as string} className="w-full h-96" title="contrato" />
                    ) : isImage(contractPreviewUrl ?? ap?.contract_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(contractPreviewUrl ?? ap?.contract_url) as string} alt="contrato" className="max-h-80 w-auto mx-auto" />
                    ) : (
                      <a href={(contractPreviewUrl ?? ap?.contract_url) as string} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Abrir em nova aba</a>
                    )}
                  </div>
                )}
              </div>

        {/* Creator display: show under contract, left aligned */}
        <div className="mt-2 text-xs text-muted-foreground">
          Criado por: {creatorDisplayName}
        </div>

        {/* Save / Edit controls */}
        <div className="pt-4 flex items-center gap-2">
          {!editingMode && (
            <Button variant="default" onClick={() => setEditingMode(true)}>Editar</Button>
          )}
          {editingMode && (
            <>
              <Button onClick={handleSaveEdits}>Salvar alterações</Button>
              <Button variant="ghost" onClick={() => {
                // restore editable state from appointment snapshot
                setEditingMode(false);
                setEditable(() => ({
                  eventname: ap?.eventname ?? null,
                  childname: ap?.childname ?? null,
                  childagegroup: ap?.childagegroup ?? null,
                  phone: ap?.phone ?? null,
                  email: ap?.email ?? null,
                  eventaddress: ap?.eventaddress ?? null,
                  address: ap?.address ?? null,
                  outofcity: ap?.outofcity ?? false,
                  ownerpresent: ap?.ownerpresent ?? false,
                  durationhours: ap?.durationhours ?? 1,
                  recreatorscount: typeof ap?.recreatorscount === 'undefined' ? null : ap?.recreatorscount ?? null,
                  valor_pago: typeof ap?.valor_pago === 'undefined' ? null : (ap?.valor_pago != null ? String(Number(ap.valor_pago) / 100) : null),
                  valor_a_pagar: typeof ap?.valor_a_pagar === 'undefined' ? null : (ap?.valor_a_pagar != null ? String(Number(ap.valor_a_pagar) / 100) : null),
                  created_by: ap?.created_by ?? null,
                  requestedbymother: typeof ap?.requestedbymother !== 'undefined' ? ap.requestedbymother : false,
                  bagid: ap?.bagid ?? null,
                  responsible_recreatorid: ap?.responsible_recreatorid ?? null,
                  recreator_ids: Array.isArray(ap?.recreator_ids) ? ap?.recreator_ids : (ap?.recreator_ids ? [ap.recreator_ids] : []),
                  requested_recreator_ids: [],
                }))
              }}>Cancelar</Button>
            </>
          )}
        </div>
      </>
      )}
        </div>
      </ScrollArea>
    </DialogContent>
  )
}
