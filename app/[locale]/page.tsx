import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const event = await prisma.event.findFirst({
    orderBy: [
      { updatedAt: "desc" },
      { createdAt: "desc" }
    ],
    select: {
      id: true,
      slug: true
    }
  });

  if (event) {
    redirect(`/invite/${event.slug || event.id}`);
  }

  redirect("/login");
}
