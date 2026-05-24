import { prisma } from "@/lib/prisma";
import { releaseExpiredReservations }
from "@/lib/cleanup";
export async function GET() {
  try {
    await releaseExpiredReservations();
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,

      stock: product.inventories.map((inventory) => ({
        warehouseId: inventory.warehouse.id,
        warehouseName: inventory.warehouse.name,

        totalUnits: inventory.totalUnits,

        reservedUnits: inventory.reservedUnits,

        availableUnits:
          inventory.totalUnits -
          inventory.reservedUnits,
      })),
    }));

    return Response.json(formattedProducts);

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}