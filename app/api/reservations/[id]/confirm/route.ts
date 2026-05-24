import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } =
      await context.params;

    const result =
      await prisma.$transaction(
        async (tx) => {

          const reservation =
            await tx.reservation.findUnique({
              where: { id },
            });

          if (!reservation) {
            throw new Error(
              "NOT_FOUND"
            );
          }

          if (
            reservation.status !==
            "PENDING"
          ) {
            throw new Error(
              "INVALID_STATUS"
            );
          }

          if (
            reservation.expiresAt <
            new Date()
          ) {

            await tx.inventory.updateMany({
              where: {
                productId:
                  reservation.productId,

                warehouseId:
                  reservation.warehouseId,
              },

              data: {
                reservedUnits: {
                  decrement:
                    reservation.quantity,
                },
              },
            });

            await tx.reservation.update({
              where: { id },

              data: {
                status: "RELEASED",
              },
            });

            throw new Error(
              "RESERVATION_EXPIRED"
            );
          }

          await tx.inventory.updateMany({
            where: {
              productId:
                reservation.productId,

              warehouseId:
                reservation.warehouseId,
            },

            data: {
              totalUnits: {
                decrement:
                  reservation.quantity,
              },

              reservedUnits: {
                decrement:
                  reservation.quantity,
              },
            },
          });

          const updatedReservation =
            await tx.reservation.update({
              where: { id },

              data: {
                status: "CONFIRMED",
              },
            });

          return updatedReservation;
        }
      );

    return Response.json(result);

  } catch (error: any) {

    if (
      error.message ===
      "RESERVATION_EXPIRED"
    ) {

      return Response.json(
        {
          error:
            "Reservation expired",
        },
        {
          status: 410,
        }
      );
    }

    return Response.json(
      {
        error:
          "Failed to confirm reservation",
      },
      {
        status: 500,
      }
    );
  }
}