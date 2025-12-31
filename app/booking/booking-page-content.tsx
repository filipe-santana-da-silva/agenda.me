"use client";
import Header from "@/components/header";
import Image from "next/image";
import BookingItem from "@/components/booking-item";
import { Barbershop } from "@/data/barbershops";
import { BookingWithRelations } from "@/data/bookings";
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
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import BarbershopCarousel from "@/components/barbershop-carousel";
import { CAROUSEL_IMAGES } from "@/data/carousel-images";
const BookingLogin = dynamic(() => import("./booking-login"), { ssr: false });

interface BookingPageContentProps {
  barbershops: Barbershop[];
  confirmedBookings: BookingWithRelations[];
}

export function BookingPageContent({
  barbershops: initialBarbershops,
  confirmedBookings: initialBookings,
}: BookingPageContentProps) {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [services, setServices] = useState<Array<{ id: string; name: string; description: string; price: number; image_url: string }>>([]);
  const [isServicesVisible, setIsServicesVisible] = useState(false);
  const [isBarbershopsVisible, setIsBarbershopsVisible] = useState(false);
  const [isBookingsVisible, setIsBookingsVisible] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const barbershopsRef = useRef<HTMLDivElement>(null);
  const bookingsRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("bookingUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        Promise.resolve().then(() => setUser(parsed));
      } catch {
        localStorage.removeItem("bookingUser");
      }
    }
  }, []);

  // Intersection Observer para lazy loading de seções
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (entry.target === servicesRef.current) {
            setIsServicesVisible(true);
          } else if (entry.target === barbershopsRef.current) {
            setIsBarbershopsVisible(true);
          } else if (entry.target === bookingsRef.current) {
            setIsBookingsVisible(true);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (servicesRef.current) observer.observe(servicesRef.current);
    if (barbershopsRef.current) observer.observe(barbershopsRef.current);
    if (bookingsRef.current) observer.observe(bookingsRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle login query param separately
  useEffect(() => {
    const shouldShowLogin = searchParams.get("login") === "true";
    if (shouldShowLogin) {
      Promise.resolve().then(() => setShowLogin(true));
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
              src="/banner.png"
              alt="Banner"
              className="w-full h-64 object-cover rounded-lg"
              width={1200}
              height={400}
              priority
            />

            {/* Bookings */}
            <div ref={bookingsRef} style={{ minHeight: initialBookings.length > 0 ? 'auto' : 0 }}>
              {user && initialBookings.length > 0 && isBookingsVisible && (
                <PageSectionContent>
                  <PageSectionTitle>Seus Agendamentos</PageSectionTitle>
                  <PageSectionScroller>
                    {initialBookings.map((booking) => (
                      <BookingItem key={booking.id} booking={booking} />
                    ))}
                  </PageSectionScroller>
                </PageSectionContent>
              )}
            </div>

            {/* Services */}
            <div ref={servicesRef} style={{ minHeight: services.length > 0 ? 'auto' : 0 }}>
              {services.length > 0 && isServicesVisible && (
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
                            service.image_url ||
                            "https://images.unsplash.com/photo-1585747860715-cd4628902d4a?w=300&h=300&fit=crop"
                          }
                          alt={service.name || 'Service'}
                          width={200}
                          height={150}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                        />
                        <div className="p-3">
                          <h3 className="font-semibold text-sm">{service.name}</h3>
                          <p className="text-xs text-gray-500">
                            {service.description}
                          </p>
                          <p className="text-sm font-bold mt-2">
                            R${(service.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </PageSectionScroller>
                </PageSectionContent>
              )}
            </div>

            {/* Popular Barbershops */}
            <div ref={barbershopsRef} style={{ minHeight: initialBarbershops.length > 0 ? 'auto' : 0 }}>
              {initialBarbershops.length > 0 && isBarbershopsVisible && (
                <PageSectionContent>
                  <PageSectionTitle>Barbearias Populares</PageSectionTitle>
                  <div className="w-full">
                    {initialBarbershops.slice(0, 1).map((barbershop: Barbershop) => (
                      <BarbershopCarousel
                        key={barbershop.id}
                        barbershop={barbershop}
                        carouselImages={CAROUSEL_IMAGES}
                      />
                    ))}
                  </div>
                </PageSectionContent>
              )}
            </div>
          </PageContainer>

          <Footer />
        </div>
      ) : null}
    </div>
  );
}
