import Image from "next/image";
import { Barbershop } from "@/data/barbershops";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface BarbershopItemProps {
  barbershop: Barbershop;
  images?: string[];
}

const BarbershopItem = ({ barbershop, images }: BarbershopItemProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageList = images && images.length > 0 ? images : [barbershop.image_url];
  const hasMultipleImages = imageList.length > 1;

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? imageList.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === imageList.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className="relative min-h-62.5 w-full rounded-xl group"
    >
      <div className="absolute top-0 left-0 z-10 h-full w-full rounded-lg bg-linear-to-t from-black to-transparent" />
      <Image
        src={imageList[currentIndex]}
        alt={barbershop.name}
        fill
        className="rounded-xl object-cover"
      />

      {/* Navigation Buttons */}
      {hasMultipleImages && (
        <div 
          className="absolute top-1/2 left-0 right-0 z-30 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity"
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
      )}

      {/* Indicators */}
      {hasMultipleImages && (
        <div 
          className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1"
        >
          {imageList.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute right-0 bottom-0 left-0 z-20 p-4">
        <h3 className="text-background text-lg font-bold">{barbershop.name}</h3>
        <p className="text-background text-xs">{barbershop.address}</p>
      </div>
    </div>
  );
};

export default BarbershopItem;
