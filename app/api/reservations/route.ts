import { createReservation }
from "@/lib/reservation";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const reservation =
      await createReservation(
        body.productId,
        body.warehouseId,
        body.quantity
      );

    return Response.json(reservation);

  } catch (error: any) {

    console.error(error);

    if (
      error.message ===
      "INSUFFICIENT_STOCK"
    ) {

      return Response.json(
        {
          error:
            "Not enough stock available",
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        error:
          "Failed to create reservation",
      },
      {
        status: 500,
      }
    );
  }
}