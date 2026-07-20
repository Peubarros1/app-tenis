/**
 * Popula o diretório com quadras reais de Recife, pesquisadas publicamente
 * (nome, endereço, contato). Coordenadas são aproximadas ao bairro/endereço
 * informado — para lançamento em produção, revalidar com geocoding preciso.
 *
 * A maioria das fotos foi indicada diretamente (fotos reais dos locais,
 * obtidas de fontes públicas como imprensa/diretórios — não são fotos
 * autorais do clube nem hospedadas por nós, são hotlinks). "Nacional Tênis
 * Clube" ainda usa uma imagem de banco (Unsplash) representativa do piso,
 * por não ter foto real cedida. Ao integrar com os proprietários reais,
 * validar direitos de uso e substituir por fotos autorizadas/hospedadas.
 *
 * Execução: npx tsx prisma/seed-recife-courts.ts
 */
import { RegisterUser } from "../src/application/use-cases/register-user";
import { CreateCourt } from "../src/application/use-cases/create-court";
import { PrismaUserRepository } from "../src/infrastructure/persistence/prisma/user-repository";
import { PrismaCourtRepository } from "../src/infrastructure/persistence/prisma/court-repository";
import { createCourtSchema } from "../src/lib/validation/court";
import { prisma } from "../src/infrastructure/persistence/prisma/client";
import { BookingMode, CourtType, SurfaceType } from "../src/generated/prisma/client";

const CURATOR_EMAIL = "diretorio@tenisrecife.com";

const REAL_COURTS = [
  {
    name: "Royal Tênis Clube",
    description: "Clube com quadras de tênis, beach tênis e tênis de mesa em Poço da Panela.",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNVKFLoa_0YiWDiAsU1blWFpQci8pCAlmk0NkOB3-GuizBAmiprE_VxENF&s=10",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.SAIBRO,
    isLighted: true,
    isIndoor: false,
    address: "Rua dos Arcos, 116",
    neighborhood: "Poço da Panela",
    latitude: -8.0341273,
    longitude: -34.9236133,
    hourlyPriceCents: null,
    phone: "(81) 99938-3452",
    officialBookingUrl: "https://letzplay.me/royal",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [
      { dayOfWeek: 0, opensAt: "06:00", closesAt: "19:00" },
      { dayOfWeek: 1, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 2, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 3, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 4, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 5, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 6, opensAt: "06:00", closesAt: "22:00" },
    ],
  },
  {
    name: "Ace Tênis Clube — Torreão",
    description: "Unidade Torreão do Ace, com quadras de tênis e pickleball.",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlGSBPfOJhWMDOemVdqCY629eLZYSvl2jpS-gyU4CnBw&s",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.QUADRA_DURA,
    isLighted: true,
    isIndoor: false,
    address: "Rua Dom João Costa, 374",
    neighborhood: "Torreão",
    latitude: -8.0388062,
    longitude: -34.882744,
    hourlyPriceCents: null,
    phone: "",
    officialBookingUrl: "https://letzplay.me/ace1/location?sport=1",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [],
  },
  {
    name: "Ace Tênis Clube — Santo Amaro",
    description: "Unidade Santo Amaro do Ace, com quadras de tênis e pickleball.",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlGSBPfOJhWMDOemVdqCY629eLZYSvl2jpS-gyU4CnBw&s",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.QUADRA_DURA,
    isLighted: true,
    isIndoor: false,
    address: "Avenida Cruz Cabugá, 555",
    neighborhood: "Santo Amaro",
    latitude: -8.0491668,
    longitude: -34.8787815,
    hourlyPriceCents: null,
    phone: "",
    officialBookingUrl: "https://letzplay.me/ace2",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [],
  },
  {
    name: "Recife Tênis Clube",
    description:
      "Clube tradicional com seis quadras de tênis cobertas de saibro, além de squash, padel e beach tennis.",
    photo:
      "https://cdn.folhape.com.br/img/pc/1100/1/dn_arquivo/2023/08/whatsapp-image-2023-08-24-at-183959.jpeg",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.SAIBRO,
    isLighted: true,
    isIndoor: true,
    address: "Rua Gonçalves de Magalhães, 699",
    neighborhood: "Ibura",
    latitude: -8.1209806,
    longitude: -34.9192294,
    hourlyPriceCents: null,
    phone: "(81) 3472-0011",
    officialBookingUrl: "https://www.recifetenisclube.com.br/servicos/tenis/",
    bookingInstructions: "Consulte disponibilidade e associação pelo site ou telefone do clube.",
    openingHours: [],
  },
  {
    name: "AABB Recife",
    description:
      "Associação Atlética Banco do Brasil, com quadras de tênis cobertas e iluminadas para uso de associados.",
    photo: "https://www.aabbsp.com.br/storage/blog/revitalizacao-do-ginasio-de-tenis.webp",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.SAIBRO,
    isLighted: true,
    isIndoor: false,
    address: "Avenida Doutor Malaquias, 204",
    neighborhood: "Graças",
    latitude: -8.0389506,
    longitude: -34.90282,
    hourlyPriceCents: null,
    phone: "",
    officialBookingUrl: "https://www.aabbrecife.com.br/estrutura-clube",
    bookingInstructions: "Uso exclusivo de associados. Consulte horários no site do clube.",
    openingHours: [],
  },
  {
    name: "Quadras de Tênis da Orla de Boa Viagem",
    description:
      "4 quadras públicas de tênis na orla de Boa Viagem, com agendamento pela Prefeitura do Recife.",
    photo:
      "https://cdn.folhape.com.br/upload/dn_arquivo/2023/05/whatsapp-image-2023-05-09-at-182901.jpeg",
    courtType: CourtType.PUBLIC_OFFICIAL,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.QUADRA_DURA,
    isLighted: false,
    isIndoor: false,
    address: "Av. Boa Viagem, 918",
    neighborhood: "Boa Viagem",
    latitude: -8.1188627,
    longitude: -34.8942664,
    hourlyPriceCents: 0,
    phone: "",
    officialBookingUrl: "https://conecta.recife.pe.gov.br/servico/1447",
    bookingInstructions:
      "Agende pelo portal Conecta Recife. Cada reserva corresponde a 1 hora de uso.",
    openingHours: [
      { dayOfWeek: 0, opensAt: "08:00", closesAt: "18:00" },
      { dayOfWeek: 1, opensAt: "08:00", closesAt: "18:00" },
      { dayOfWeek: 2, opensAt: "08:00", closesAt: "18:00" },
      { dayOfWeek: 3, opensAt: "08:00", closesAt: "18:00" },
      { dayOfWeek: 4, opensAt: "08:00", closesAt: "18:00" },
      { dayOfWeek: 5, opensAt: "08:00", closesAt: "18:00" },
      { dayOfWeek: 6, opensAt: "08:00", closesAt: "18:00" },
    ],
  },
  {
    name: "Legacy Tennis Center",
    description: "Clube premium com três quadras de saibro totalmente cobertas, em Afogados.",
    photo:
      "https://res.cloudinary.com/lptennis/image/upload/v1749142783/zbkssimns4f6gqyh0mb6.jpg?_a=BACJ3SEv",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.SAIBRO,
    isLighted: true,
    isIndoor: true,
    address: "Estrada dos Remédios, 1360",
    neighborhood: "Afogados",
    latitude: -8.0681261,
    longitude: -34.9082731,
    hourlyPriceCents: null,
    phone: "",
    officialBookingUrl: "https://letzplay.me/legacytennis",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [
      { dayOfWeek: 0, opensAt: "06:00", closesAt: "18:00" },
      { dayOfWeek: 1, opensAt: "05:00", closesAt: "23:00" },
      { dayOfWeek: 2, opensAt: "05:00", closesAt: "23:00" },
      { dayOfWeek: 3, opensAt: "05:00", closesAt: "23:00" },
      { dayOfWeek: 4, opensAt: "05:00", closesAt: "23:00" },
      { dayOfWeek: 5, opensAt: "05:00", closesAt: "23:00" },
      { dayOfWeek: 6, opensAt: "06:00", closesAt: "18:00" },
    ],
  },
  {
    name: "Prime Tennis Academy",
    description: "Academia de tênis na Imbiribeira, com escolinha e locação de quadras.",
    photo:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_gDWv9nllXLSAWyWsDEZ5ckvvVBe0BWfMY21d-HKNl4zFeZk18oRy9JU&s=10",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.QUADRA_DURA,
    isLighted: true,
    isIndoor: false,
    address: "Rua Gonçalves de Magalhães, 745",
    neighborhood: "Imbiribeira",
    latitude: -8.1188723,
    longitude: -34.9175954,
    hourlyPriceCents: null,
    phone: "",
    officialBookingUrl: "https://letzplay.me/primetennis",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [],
  },
  {
    name: "Nacional Tênis Clube",
    description:
      "Quatro quadras de tênis (uma com medidas oficiais) e cinco de beach tennis, todas cobertas, na Ilha do Retiro.",
    photo:
      "https://images.unsplash.com/photo-1756672619539-b44173fffbe8?w=1200&q=80&auto=format&fit=crop",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.QUADRA_DURA,
    isLighted: true,
    isIndoor: true,
    address: "Av. Sport Clube do Recife, s/n",
    neighborhood: "Ilha do Retiro",
    latitude: -8.0614493,
    longitude: -34.902658,
    hourlyPriceCents: null,
    phone: "",
    officialBookingUrl: "https://letzplay.me/nacionaltc",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [
      { dayOfWeek: 0, opensAt: "06:00", closesAt: "20:00" },
      { dayOfWeek: 1, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 2, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 3, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 4, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 5, opensAt: "06:00", closesAt: "23:00" },
      { dayOfWeek: 6, opensAt: "06:00", closesAt: "22:00" },
    ],
  },
  {
    name: "Squash Tennis Center",
    description: "Complexo com onze quadras de tênis e quatro de squash, em Boa Viagem.",
    photo:
      "https://assets-cdn.wellhub.com/images/?su=https://images.partners.gympass.com/image/filename/3275720/lg_lBFZUpWdYC_0uVfHQJcn5kpo3JoWHN7q.jpeg",
    courtType: CourtType.PRIVATE,
    bookingMode: BookingMode.OFFICIAL_INTEGRATION,
    surfaceType: SurfaceType.QUADRA_DURA,
    isLighted: true,
    isIndoor: false,
    address: "Rua Doutor Luiz Correia de Oliveira, 375",
    neighborhood: "Boa Viagem",
    // Geocoding não encontrou o endereço exato no OpenStreetMap; usando o
    // centroide do bairro Boa Viagem como aproximação (menos preciso que os
    // demais, que foram geocodificados pelo endereço completo).
    latitude: -8.1235027,
    longitude: -34.9033955,
    hourlyPriceCents: null,
    phone: "(81) 3341-7257",
    officialBookingUrl: "https://letzplay.me/squashtenniscenter",
    bookingInstructions: "Reserve pelo aplicativo LetzPlay.",
    openingHours: [],
  },
];

async function main() {
  // Remove quadras de execuções anteriores por nome (cobre também as
  // PUBLIC_OFFICIAL, que não têm ownerId e por isso não seriam pegas só
  // filtrando pelo curador).
  await prisma.court.deleteMany({
    where: { name: { in: REAL_COURTS.map((court) => court.name) } },
  });

  const existingCurator = await prisma.user.findUnique({ where: { email: CURATOR_EMAIL } });
  if (existingCurator) {
    await prisma.court.deleteMany({ where: { ownerId: existingCurator.id } });
    await prisma.user.delete({ where: { id: existingCurator.id } });
  }

  const registerUser = new RegisterUser(new PrismaUserRepository());
  const curator = await registerUser.execute({
    name: "Diretório Tênis Recife",
    email: CURATOR_EMAIL,
    password: "senhaSegura123",
  });

  const createCourt = new CreateCourt(new PrismaCourtRepository());

  for (const court of REAL_COURTS) {
    const input = createCourtSchema.parse({
      name: court.name,
      description: court.description,
      courtType: court.courtType,
      bookingMode: court.bookingMode,
      surfaceType: court.surfaceType,
      isLighted: court.isLighted,
      isIndoor: court.isIndoor,
      address: court.address,
      neighborhood: court.neighborhood,
      latitude: court.latitude,
      longitude: court.longitude,
      hourlyPriceCents: court.hourlyPriceCents ?? undefined,
      officialBookingUrl: court.officialBookingUrl,
      bookingInstructions: court.bookingInstructions,
      phone: court.phone,
    });
    const created = await createCourt.execute(curator.id, input, [court.photo], court.openingHours);
    console.log("criada:", court.name, created.id);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
