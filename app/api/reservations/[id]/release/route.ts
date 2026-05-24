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

    const reservation =
      await prisma.reservation.findUnique({
        where: { id },
      });

    if (!reservation) {

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

    if (
      reservation.status !==
      "PENDING"
    ) {

      return Response.json(
        {
          error:
            "Reservation already processed",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(
      async (tx) => {

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
      }
    );

    return Response.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

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