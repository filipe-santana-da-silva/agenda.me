import { Suspense } from "react";
import { BookingPageContent } from "./booking-page-content";
import { getBarbershops } from "@/data/barbershops";

const BookingsPage = async () => {
  const barbershops = await getBarbershops();
  const confirmedBookings: Array<Record<string, unknown>> = [];

  // Mapa de imagens dos serviços
  const serviceImages: Record<string, string> = {
    "corte de cabelo": "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
    "barba premium": "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
    "pézinho": "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    "sobrancelha": "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
    "massagem": "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
    "hidratação": "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
  };

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Carregando...</div>}>
      <BookingPageContent
        barbershops={barbershops}
        confirmedBookings={confirmedBookings}
        serviceImages={serviceImages}
      />
    </Suspense>
  );
};

export default BookingsPage;