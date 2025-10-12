const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const items = [
    {
      name: "IP-камера 2MP Wi-Fi",
      price: 599000,
      image: "https://picsum.photos/seed/cam1/800/450",
      tags: "Wi-Fi,2MP", // строки вместо массива
      features: "1080p,IR", // строки вместо массива
      stock: 100,
    },
    {
      name: "AHD 5MP уличная",
      price: 425000,
      image: "https://picsum.photos/seed/cam2/800/450",
      tags: "AHD,5MP",
      features: "IP66,Metal",
      stock: 200,
    },
  ];

  for (const p of items) {
    await prisma.product.create({ data: p });
  }

  console.log("✅ Seed завершён, товары добавлены!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
