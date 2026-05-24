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

          const updatedReservation =
            await tx.reservation.update({
              where: { id },

              data: {
                status: "RELEASED",
              },
            });

          return updatedReservation;
        }
      );

    return Response.json(result);

  } catch (error: any) {

    if (
      error.message ===
      "NOT_FOUND"
    ) {

      return Response.json(
        {
          error:
            "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        error:
          "Failed to release reservation",
      },
      {
        status: 500,
      }
    );
  }
}