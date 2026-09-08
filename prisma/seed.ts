import { prisma } from "../src/lib/prisma";
import { seedDemoData } from "../src/lib/seedDemoData";

seedDemoData()
  .then(({ contactCount }) => {
    console.log(`Seed completado: ${contactCount} contactos de ejemplo creados.`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
