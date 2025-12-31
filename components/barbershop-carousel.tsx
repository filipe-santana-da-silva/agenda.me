"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Barbershop } from "@/data/barbershops";

interface CarouselImage {
  id: string;
  name: string;
  imageUrl: string;
}

interface BarbershopCarouselProps {
  barbershop: Barbershop;
  carouselImages: CarouselImage[];
}

const BarbershopCarousel = ({
  barbershop,
  carouselImages,
}: BarbershopCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCarouselVisible, setIsCarouselVisible] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);

  // Lazy load carousel usando Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCarouselVisible(true);
          // Precarregar imagens adjacentes
          preloadAdjacentImages(currentIndex);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Precarregar imagens quando o índice mudar
  useEffect(() => {
    if (isCarouselVisible) {
      preloadAdjacentImages(currentIndex);
    }
  }, [currentIndex, isCarouselVisible]);

  // Precarregar imagens adjacentes
  const preloadAdjacentImages = (index: number) => {
    const nextIndex = (index + 1) % carouselImages.length;
    const prevIndex = (index - 1 + carouselImages.length) % carouselImages.length;

    [index, nextIndex, prevIndex].forEach((i) => {
      if (!preloadedImages.has(carouselImages[i].imageUrl)) {
        const img = new window.Image();
        img.src = carouselImages[i].imageUrl;
        setPreloadedImages((prev) => new Set(prev).add(carouselImages[i].imageUrl));
      }
    });
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === carouselImages.length - 1 ? 0 : prev + 1
    );
  };

  const currentImage = carouselImages[currentIndex];

  return (
    <div 
      ref={carouselRef}
      className="relative w-full overflow-hidden rounded-lg group"
    >
      {isCarouselVisible && (
        <>
          <div className="relative h-64 w-full bg-gray-200">
            <Image
              src={currentImage.imageUrl}
              alt={currentImage.name}
              fill
              quality={60}
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:opacity-80 transition-opacity duration-300"
            />
            <div className="absolute top-0 left-0 z-10 h-full w-full bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Info */}
          <div className="absolute right-0 bottom-0 left-0 z-20 flex flex-col justify-between p-4">
            <div>
              <h2 className="text-background text-2xl font-bold">
                {barbershop.name}
              </h2>
              <p className="text-background text-sm">{barbershop.address}</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div 
            className="absolute top-1/2 left-0 right-0 z-30 -translate-y-1/2 flex justify-between px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>

          {/* Indicators */}
          <div 
            className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BarbershopCarousel;
