import Header from "@/components/header";
import Image from "next/image";
import banner from "@/public/banner.png";
import BookingItem from "@/components/booking-item";

import { getBarbershops } from "@/data/barbershops";
import { getUserBookings } from "@/data/bookings";
import {
  PageContainer,
  PageSectionContent,
  PageSectionScroller,
  PageSectionTitle,
} from "@/components/ui/page";
import Footer from "@/components/footer";

export default async function Home() {
  const barbershops = await getBarbershops();
  const { confirmedBookings } = await getUserBookings();

  return (
    <div>
      <Header />
      <PageContainer>
        <Image
          src={banner}
          alt="Agende nos melhores com a Aparatus"
          sizes="100vw"
          className="h-auto w-full"
        />
        {confirmedBookings.length > 0 && (
          <PageSectionContent>
            <PageSectionTitle>Meus Agendamentos</PageSectionTitle>
            <PageSectionScroller>
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </PageSectionScroller>
          </PageSectionContent>
        )}
        <PageSectionContent>
          <PageSectionTitle>Barbearias</PageSectionTitle>
          <PageSectionScroller>
            ols
          </PageSectionScroller>
        </PageSectionContent>
      </PageContainer>
      <Footer />
    </div>
  );
}
