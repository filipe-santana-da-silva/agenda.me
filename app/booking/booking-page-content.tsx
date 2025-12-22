"use client";
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
import QuickSearch from "@/components/quick-search";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import BarbershopCarousel from "@/components/barbershop-carousel";
import { CAROUSEL_IMAGES } from "@/data/carousel-images";
const BookingLogin = dynamic(() => import("./booking-login"), { ssr: false });

interface BookingPageContentProps {
  barbershops: any[];
  confirmedBookings: any[];
  serviceImages: Record<string, string>;
}

export function BookingPageContent({
  barbershops: initialBarbershops,
  confirmedBookings: initialBookings,
  serviceImages,
}: BookingPageContentProps) {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const supabase = createClient();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("bookingUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Verificar se deve mostrar login via URL
    if (searchParams.get("login") === "true") {
      setShowLogin(true);
    }
  }, [searchParams]);

  // Salvar usuário no localStorage ao logar
  useEffect(() => {
    if (user) {
      localStorage.setItem("bookingUser", JSON.stringify(user));
    }
  }, [user]);

  // Buscar serviços do Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*");

        if (error) {
          console.error("Erro ao buscar serviços:", error);
          return;
        }

        setServices(data || []);
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
      }
    };

    fetchServices();
  }, [supabase]);

  return (
    <div>
      {showLogin && (
        <BookingLogin
          onLogin={(user) => {
            setUser(user);
            setShowLogin(false);
          }}
        />
      )}

      {!showLogin ? (
        <div>
          <Header />
          <PageContainer>
            {/* Quick Search */}
            <PageSectionContent>
              <QuickSearch />
            </PageSectionContent>

         

            {/* Banner */}
            <Image
              src={banner}
              alt="Banner"
              className="w-full h-64 object-cover rounded-lg"
            />

            {/* Bookings */}
            {user && initialBookings.length > 0 && (
              <PageSectionContent>
                <PageSectionTitle>Seus Agendamentos</PageSectionTitle>
                <PageSectionScroller>
                  {initialBookings.map((booking) => (
                    <BookingItem key={booking.id} booking={booking} />
                  ))}
                </PageSectionScroller>
              </PageSectionContent>
            )}

            {/* Services */}
            {services.length > 0 && (
              <PageSectionContent>
                <PageSectionTitle>Serviços</PageSectionTitle>
                <PageSectionScroller>
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="min-w-50 h-auto overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <Image
                        src={
                          serviceImages[service.name?.toLowerCase()] ||
                          "https://images.unsplash.com/photo-1585747860715-cd4628902d4a?w=300&h=300&fit=crop"
                        }
                        alt={service.name}
                        width={200}
                        height={150}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="font-semibold text-sm">{service.name}</h3>
                        <p className="text-xs text-gray-500">
                          {service.description}
                        </p>
                        <p className="text-sm font-bold mt-2">
                          R${(service.price).toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </PageSectionScroller>
              </PageSectionContent>
            )}

            {/* Popular Barbershops */}
            {initialBarbershops.length > 0 && (
              <PageSectionContent>
                <PageSectionTitle>Barbearias Populares</PageSectionTitle>
                <div className="w-full">
                  {initialBarbershops.slice(0, 1).map((barbershop) => (
                    <BarbershopCarousel
                      key={barbershop.id}
                      barbershop={barbershop}
                      carouselImages={CAROUSEL_IMAGES}
                    />
                  ))}
                </div>
              </PageSectionContent>
            )}
          </PageContainer>

          <Footer />
        </div>
      ) : null}
    </div>
  );
}
