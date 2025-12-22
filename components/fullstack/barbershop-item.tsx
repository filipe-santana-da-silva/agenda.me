import Image from "next/image"
import Link from "next/link"

interface Barbershop {
  id: string
  name: string
  address: string
  image_url: string
}

interface BarbershopItemProps {
  barbershop: Barbershop
}

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  return (
    <Link
      href="/barbershops-fullstack"
      className="relative min-h-[200px] min-w-[290px] rounded-xl"
    >
      <div className="absolute top-0 left-0 z-10 h-full w-full rounded-lg bg-gradient-to-t from-black to-transparent" />
      <Image
        src={barbershop.image_url}
        alt={barbershop.name}
        fill
        className="rounded-xl object-cover"
      />
      <div className="absolute right-0 bottom-0 left-0 z-20 p-4">
        <h3 className="text-background text-lg font-bold">{barbershop.name}</h3>
        <p className="text-background text-xs">{barbershop.address}</p>
      </div>
    </Link>
  )
}

export default BarbershopItem
