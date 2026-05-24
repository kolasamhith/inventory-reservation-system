import { prisma } from "@/lib/prisma";

const RESERVATION_WINDOW_MINUTES = 10;

export async function createReservation(
  productId: string,
  warehouseId: string,
  quantity: number
) {

  return prisma.$transaction(async (tx) => {

    const inventoryRows =
      await tx.$queryRaw<
        any[]
      >`
        SELECT *
        FROM "Inventory"
        WHERE "productId" = ${productId}
        AND "warehouseId" = ${warehouseId}
        FOR UPDATE
      `;

    const inventory = inventoryRows[0];

    if (!inventory) {
      throw new Error("INVENTORY_NOT_FOUND");
    }

    const availableUnits =
      inventory.totalUnits -
      inventory.reservedUnits;

    if (availableUnits < quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    await tx.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        reservedUnits: {
          increment: quantity,
        },
      },
    });

    const expiresAt =
      new Date(
        Date.now() +
        RESERVATION_WINDOW_MINUTES *
        60 *
        1000
      );

    const reservation =
      await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          status: "PENDING",
        },
      });

    return reservation;
  });
}