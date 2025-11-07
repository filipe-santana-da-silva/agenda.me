'use client'

import Link from 'next/link'
import { usePermissoes } from './usePermission'

export default function Menu() {
  const { role, paginas } = usePermissoes()

  return (
    <nav className="flex flex-col gap-2 p-4">
      {paginas.map((page) => (
        <Link key={page} href={`/${page.toLowerCase()}`}>
          {page}
        </Link>
      ))}

      {role === 'ADMIN' && (
        <Link href="/admin">Administração</Link>
      )}
    </nav>
  )
}
