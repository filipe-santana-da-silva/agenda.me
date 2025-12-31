import { Suspense } from "react";
import { BookingPageContent } from "./booking-page-content";
import { getBarbershops } from "@/data/barbershops";
import { BookingWithRelations } from "@/data/bookings";

const BookingsPage = async () => {
  const barbershops = await getBarbershops();
  const confirmedBookings: BookingWithRelations[] = [];

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Carregando...</div>}>
      <BookingPageContent
        barbershops={barbershops}
        confirmedBookings={confirmedBookings}
      />
    </Suspense>
  );
};

export default BookingsPage;