import { prisma } from "@/lib/prisma";
import EditPropertyForm from "./EditPropertyForm";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.propertyListing.findUnique({
    where: { id },
    include: { 
      images: true,
      assignedStaff: true
    }
  });

  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { order: "asc" }
  });

  if (!property) {
    notFound();
  }

  return <EditPropertyForm property={property} teamMembers={teamMembers} />;
}
