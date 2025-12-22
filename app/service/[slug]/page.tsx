"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";

interface ServiceInfo {
  title: string;
  description: string;
  longDescription: string;
  benefits: string[];
  image: string;
  color: string;
}

const servicesData: Record<string, ServiceInfo> = {
  cabelo: {
    title: "Corte de Cabelo",
    description: "Transforme seu look com um corte profissional",
    longDescription:
      "Nossos barbeiros experientes oferecem cortes modernos e clássicos, adaptados ao seu tipo de cabelo e estilo pessoal. Com técnicas atualizadas e atenção aos detalhes, garantimos um resultado impecável.",
    benefits: [
      "Cortes personalizados para seu estilo",
      "Técnicas modernas e clássicas",
      "Acabamento perfeito em todos os detalhes",
      "Consultoria de estilo profissional",
      "Produtos de qualidade premium",
    ],
    image: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
    color: "from-blue-500 to-blue-600",
  },
  barba: {
    title: "Cuidados com Barba",
    description: "Mantenha sua barba impecável e bem cuidada",
    longDescription:
      "Oferecemos um serviço completo de cuidados com barba, incluindo modelagem, aparagem e tratamentos especiais. Nossos profissionais conhecem as melhores técnicas para manter sua barba saudável e com aparência premium.",
    benefits: [
      "Aparagem e modelagem profissional",
      "Tratamentos nutritivos para a barba",
      "Design personalizado de contorno",
      "Produtos especializados",
      "Consultoria de crescimento e cuidados",
    ],
    image: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
    color: "from-amber-600 to-amber-700",
  },
  acabamento: {
    title: "Acabamento Premium",
    description: "Detalhes que fazem a diferença",
    longDescription:
      "Complemente seu look com nossos serviços de acabamento. Desde ajustes finos até tratamentos especiais, trabalhamos cada detalhe para deixar você impecável.",
    benefits: [
      "Aparagem de contorno precisa",
      "Tratamentos de hidratação",
      "Coloração e tingimento",
      "Limpeza profunda da pele",
      "Acabamento artesanal",
    ],
    image: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    color: "from-purple-500 to-purple-600",
  },
  sobrancelha: {
    title: "Design de Sobrancelha",
    description: "Realce a beleza natural do seu rosto",
    longDescription:
      "Nossas especialistas em design de sobrancelha trabalham para realçar a beleza natural do seu rosto. Com técnicas precisas e produtos de qualidade, criamos o formato perfeito para você.",
    benefits: [
      "Design personalizado para seu rosto",
      "Técnicas precisas e seguras",
      "Henna e tinturas de qualidade",
      "Cuidados pós-procedimento",
      "Resultado duradouro",
    ],
    image: "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
    color: "from-rose-500 to-rose-600",
  },
  massagem: {
    title: "Massagem Relaxante",
    description: "Relaxe e revitalize seu corpo",
    longDescription:
      "Oferecemos massagens profissionais para alívio de tensões e bem-estar total. Nossos terapeutas usam técnicas comprovadas para deixar você relaxado e revigorado.",
    benefits: [
      "Alívio de tensão muscular",
      "Melhora da circulação",
      "Relaxamento completo",
      "Técnicas terapêuticas",
      "Ambiente aconchegante e tranquilo",
    ],
    image: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
    color: "from-teal-500 to-teal-600",
  },
  hidratacao: {
    title: "Hidratação Profunda",
    description: "Cuide da saúde da sua pele",
    longDescription:
      "Tratamentos de hidratação profunda para deixar sua pele saudável, brilhante e revitalizada. Utilizamos os melhores produtos e técnicas do mercado.",
    benefits: [
      "Hidratação intensiva",
      "Produtos premium importados",
      "Restauração da vitalidade",
      "Proteção e nutrição",
      "Resultado imediato e duradouro",
    ],
    image: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    color: "from-green-500 to-green-600",
  },
};

const ServicePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const service = servicesData[slug] || servicesData["cabelo"];

  return (
    <div>
      <Header />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className={`bg-gradient-to-r ${service.color} text-white py-16`}>
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-5xl font-bold mb-4">{service.title}</h1>
            <p className="text-xl mb-8 opacity-90">{service.description}</p>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 gap-2"
              onClick={() => router.push("/booking")}
            >
              Agendar Agora
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={600}
                  height={500}
                  priority
                  quality={95}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Sobre este Serviço</h2>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  {service.longDescription}
                </p>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold mb-4">Benefícios</h3>
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="size-6 text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para se transformar?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Escolha o melhor barbeiro e agende seu atendimento agora mesmo!
            </p>
            <Button
              size="lg"
              className={`bg-gradient-to-r ${service.color} text-white gap-2`}
              onClick={() => router.push("/booking")}
            >
              Agendar Serviço
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServicePage;
