import Header from "@/components/header";
import Footer from "@/components/footer";
import { getUserBookings } from "@/data/bookings";
import {
  PageContainer,
  PageSectionContent,
  PageSectionTitle,
} from "@/components/ui/page";
import BookingItem from "@/components/booking-item";

const BookingsPage = async () => {
  const { confirmedBookings, finishedBookings } = await getUserBookings();

  return (
    <div>
      <Header />
      <PageContainer>
        <h1 className="text-xl font-bold mb-6">Meus Agendamentos</h1>

        {confirmedBookings.length > 0 && (
          <PageSectionContent>
            <PageSectionTitle>Confirmados</PageSectionTitle>
            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </PageSectionContent>
        )}

        {finishedBookings.length > 0 && (
          <PageSectionContent>
            <PageSectionTitle>Finalizados</PageSectionTitle>
            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </PageSectionContent>
        )}

        {confirmedBookings.length === 0 && finishedBookings.length === 0 && (
          <PageSectionContent>
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhum agendamento encontrado. {" "}
              <a href="/booking" className="text-primary hover:underline font-medium">
                Agendar agora
              </a>
            </p>
          </PageSectionContent>
        )}
      </PageContainer>
      <Footer />
    </div>
  );
};

export default BookingsPage;
