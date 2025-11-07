'use client'

import LoginForm from "@/app/components/login-form"
import Image from 'next/image'

export default function LoginPage(){
    return (
        <div style={{ backgroundImage: "url('/background.svg')"}} className="flex h-screen w-full items-center justify-center px-4 bg-cover bg-center bg-no-repeat">
            <div className="absolute top-6 left-6">
                <Image src="/logo.svg" alt="Logo" width={80} height={40} />
            </div>
            <LoginForm/>
        </div>
    )
}