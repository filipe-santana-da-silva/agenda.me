'use client'

import LoginFormSteps from "@/app/components/login-form-steps"
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function LoginPage(){
    const [currentSlide, setCurrentSlide] = useState(0)

    const slides = [
        '/barbearia.jpg',
        '/beleza.png',
        '/barbeiro.png',
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)
        
        return () => clearInterval(interval)
    }, [slides.length])

    return (
        <div className="flex h-screen w-full relative overflow-hidden bg-white">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-blue-100 to-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-purple-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Logo */}
            <div className="absolute top-8 left-8 z-20">
                <Image src="/logo.png" alt="Logo" width={200} height={140} />
            </div>

            {/* Left Side - Carousel */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden">
                <div className="relative w-full h-full">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            <Image
                                src={slide}
                                alt={`Slide ${index + 1}`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            {/* Dark Overlay */}
                            <div className="absolute inset-0 bg-black/20"></div>
                            
                            {/* Text Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="text-center text-white px-8">
                                    <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
                                        Gerencie o seu salão da melhor forma
                                    </h2>
                                    <p className="text-xl opacity-90 drop-shadow-md">
                                        Transforme sua gestão com nossa plataforma completa
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Slide Indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-300 rounded-full ${
                                    index === currentSlide
                                        ? 'bg-white w-8 h-2'
                                        : 'bg-white/50 w-2 h-2 hover:bg-white/75'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="relative w-full lg:w-1/2 flex flex-col items-center justify-center px-6 lg:px-12 z-10">
                {/* Additional accent blur */}
                <div className="absolute top-1/4 right-0 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
                
                <div className="relative z-10 overflow-y-auto max-h-screen py-8">
                    <LoginFormSteps/>
                </div>
            </div>
        </div>
    )
}