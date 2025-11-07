import { Button } from "@/components/ui/button";

export function Header(){
    return (
        <header className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Contratos</h1>
            <Button className='bg-gray-600 hover:bg-black cursor-pointer text-xl mr-8'>Gerar PDF</Button>
        </header>
    )
}