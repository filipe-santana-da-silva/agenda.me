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
import { Eye } from 'lucide-react'

interface DialogAppointmentProps {
  appointment: AppointmentWithService | null
}

export function DialogAppointment({ appointment }: DialogAppointmentProps) {
  // Always render DialogContent to keep the component tree stable between
  // server and client renders. Rendering nothing here when the dialog root
  // is present can cause React/Next to complain about missing static flags
  // when the portal/content is mounted asynchronously.
  const ap = appointment ?? null
    const formattedDate = ap ? format(new Date(ap.appointmentdate), 'dd/MM/yyyy') : ''
    const formattedPrice = ap ? formatCurrancy((ap.service?.price ?? 0) / 100) : ''

  const [recreatorNames, setRecreatorNames] = useState<string[]>([])
  const [responsibleName, setResponsibleName] = useState<string | null>(null)
  const [bagName, setBagName] = useState<string | null>(null)
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

  useEffect(() => {
    setEventName(ap?.eventname ?? null)
  }, [ap])

  useEffect(() => {
    let mounted = true
    async function loadRelated() {
      try {
        const supabase = createClient()
        const ids: string[] = []
        if (ap && ap.recreator_ids && Array.isArray(ap.recreator_ids)) {
          for (const r of ap.recreator_ids) ids.push(String(r))
        }
        if (ap && ap.recreatorid) ids.push(String(ap.recreatorid))

        if (ids.length > 0) {
          const { data, error } = await supabase.from('Recreator').select('id, name').in('id', ids)
          if (!error && data) {
            if (!mounted) return
            const map = new Map<string, string>()
            data.forEach((d: any) => map.set(String(d.id), d.name ?? String(d.id)))
            const names = ids.map((id) => map.get(String(id)) ?? id)
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
      } catch (err) {
        // ignore
      }
    }
    loadRelated()
    return () => {
      mounted = false
    }
  }, [appointment])

  function openInNewTab(url?: string | null) {
    if (!url) return
    window.open(url, '_blank', 'noreferrer')
  }

  const isImage = (url?: string | null) => /\.(png|jpe?g|gif|webp)$/i.test(String(url ?? ''))
  const isPdf = (url?: string | null) => /\.pdf$/i.test(String(url ?? ''))

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Detalhes do agendamento</DialogTitle>
        <DialogDescription>Veja todos os detalhes do agendamento</DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-2 text-sm">
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
                    {editingEventName ? (
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
                          } finally {
                            setSavingEventName(false)
                          }
                        }} disabled={savingEventName}>{savingEventName ? 'Salvando...' : 'Salvar'}</Button>
                        <Button variant="ghost" onClick={() => { setEditingEventName(false); setEventName(ap?.eventname ?? null) }}>Cancelar</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-medium">{eventName ?? <span className="text-muted-foreground">(sem nome)</span>}</div>
                        <Button variant="ghost" size="icon" onClick={() => setEditingEventName(true)} title="Editar nome do evento">Editar</Button>
                      </div>
                    )}
                  </div>
                  <div className="text-lg font-semibold">{ap.contractorname}</div>
                  <div className="text-sm text-muted-foreground">{ap.childname}</div>
                </div>
                <div className="text-sm text-right">
                  {ap.time}
                  <div>{formattedDate}</div>
                  <div>Duração: {ap.durationhours ?? 1}h</div>
                </div>
              </div>

              <p>
                <span className="font-semibold">Telefone:</span> {ap.phone}
              </p>

              {ap.childagegroup && (
                <p>
                  <span className="font-semibold">Faixa etária:</span> {ap.childagegroup}
                </p>
              )}

              <p>
                <span className="font-semibold">Email:</span> {ap.email}
              </p>

              {ap.eventaddress && (
                <p>
                  <span className="font-semibold">Endereço do evento:</span> {ap.eventaddress}
                </p>
              )}

              {ap.address && (
                <p>
                  <span className="font-semibold">Endereço do contratante:</span> {ap.address}
                </p>
              )}

              <p>
                <span className="font-semibold">Fora da cidade:</span> {String(ap.outofcity) === 'true' || ap.outofcity ? 'Sim' : 'Não'}
              </p>

              {typeof ap.requestedbymother !== 'undefined' && (
                <p>
                  <span className="font-semibold">Recreador solicitado pela mãe:</span> {ap.requestedbymother ? 'Sim' : 'Não'}
                </p>
              )}

              {typeof ap.ownerpresent !== 'undefined' && (
                <p>
                  <span className="font-semibold">Dono presente:</span> {ap.ownerpresent ? 'Sim' : 'Não'}
                </p>
              )}

              {bagName && (
                <p>
                  <span className="font-semibold">Mala:</span> {bagName}
                </p>
              )}

              {responsibleName && (
                <p>
                  <span className="font-semibold">Recreador responsável:</span> {responsibleName}
                </p>
              )}

              {recreatorNames && recreatorNames.length > 0 && (
                <p>
                  <span className="font-semibold">Recreadores presentes:</span> {recreatorNames.join(', ')}
                </p>
              )}

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

        {/* removed created/author display as requested */}

        {/* Removed embedded preview panels — use Eye icon / open-in-new-tab instead. */}
        {/* debug removed */}
      </>
      )}
      </div>
    </DialogContent>
  )
}
