'use client'

import dynamic from 'next/dynamic'

const ContractorList = dynamic(() => import('./service-list').then(mod => mod.ContractorList), {
  ssr: false,
  loading: () => <div className="p-4 text-muted-foreground">Carregando contratantes...</div>
})

interface Contractor {
  id: string
  name: string
  childname: string
  phone: string
  address: string
  maritalstatus?: string | null
  profession?: string | null
  documenttype: string
  documentvalue: string
  createdat?: string
  updatedat?: string
  personType?: 'fisica' | 'juridica' | null
}

interface ContratantesContentProps {
  contractors: Contractor[]
}

export function ContratantesContent({ contractors }: ContratantesContentProps) {
  return <ContractorList contractors={contractors} />
}
