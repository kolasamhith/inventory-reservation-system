import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  console.log("Seeding database...");

  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Warehouses
  const hyderabadWarehouse =
    await prisma.warehouse.create({
      data: {
        name: "Hyderabad Warehouse",
        location: "Hyderabad",
      },
    });

  const bangaloreWarehouse =
    await prisma.warehouse.create({
      data: {
        name: "Bangalore Warehouse",
        location: "Bangalore",
      },
    });

  // Products
  const iphone =
    await prisma.product.create({
      data: {
        name: "iPhone 15",
        sku: "IPHONE-15",
      },
    });

  const nikeShoes =
    await prisma.product.create({
      data: {
        name: "Nike Shoes",
        sku: "NIKE-001",
      },
    });

  // Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId:
          hyderabadWarehouse.id,
        totalUnits: 10,
        reservedUnits: 0,
      },
      {
        productId: iphone.id,
        warehouseId:
          bangaloreWarehouse.id,
        totalUnits: 5,
        reservedUnits: 0,
      },
      {
        productId: nikeShoes.id,
        warehouseId:
          hyderabadWarehouse.id,
        totalUnits: 20,
        reservedUnits: 0,
      },
    ],
  });

  console.log(
    "Database seeded successfully!"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });