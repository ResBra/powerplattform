import { prisma } from "@/lib/prisma";
import NewPropertyForm from "./NewPropertyForm";

export default async function NewPropertyPage() {
  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { order: "asc" }
  });

  return <NewPropertyForm teamMembers={teamMembers} />;
}
