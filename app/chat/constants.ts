import { Service, Professional } from "./types";

// Static services data
export const STATIC_SERVICES: Service[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Corte de Cabelo",
    duration: "01:00:00",
    price: 60,
    imageUrl: "https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png",
    category: "Cabelos",
    description: "Corte de cabelo personalizado com tesoura e/ou máquina, realizado por nossos profissionais experientes.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Barba",
    duration: "00:20:00",
    price: 40,
    imageUrl: "https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png",
    category: "Barba",
    description: "Aparação e finalização de barba com acabamento perfeito e produtos de qualidade.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Pézinho",
    duration: "00:30:00",
    price: 35,
    imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    category: "Corpo",
    description: "Aparação dos pelos da nuca e contorno do rosto para um acabamento limpo e preciso.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Sobrancelha",
    duration: "00:15:00",
    price: 20,
    imageUrl: "https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png",
    category: "Rosto",
    description: "Design e preenchimento de sobrancelha para um visual mais definido e harmonioso.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Massagem",
    duration: "00:45:00",
    price: 50,
    imageUrl: "https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png",
    category: "Bem-estar",
    description: "Massagem relaxante para aliviar tensões e promover bem-estar físico e mental.",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Hidratação",
    duration: "00:30:00",
    price: 25,
    imageUrl: "https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png",
    category: "Tratamentos",
    description: "Tratamento hidratante intensivo para peles ressecadas e descamação, com produtos premium.",
  },
];

// Static professionals data
export const STATIC_PROFESSIONALS: Professional[] = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    name: "Vitor",
    position: "Barbeiro",
    department: "Salão",
    imageUrl: "https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    name: "Vinícius",
    position: "Barbeiro",
    department: "Salão",
    imageUrl: "https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440003",
    name: "João Pedro",
    position: "Barbeiro",
    department: "Salão",
    imageUrl: "https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440004",
    name: "Carlos",
    position: "Barbeiro",
    department: "Salão",
    imageUrl: "https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png",
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440005",
    name: "Lucas",
    position: "Barbeiro",
    department: "Salão",
    imageUrl: "https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png",
  },
];
