import { prisma } from "@/lib/prisma";

export async function GET(
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

    return Response.json(
      reservation
    );

  } catch {

    return Response.json(
      {
        error:
          "Failed to fetch reservation",
      },
      {
        status: 500,
      }
    );
  }
}