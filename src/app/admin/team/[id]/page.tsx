import { prisma } from "@/lib/prisma";
import EditTeamForm from "./EditTeamForm";
import { notFound } from "next/navigation";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!member) {
    notFound();
  }

  return <EditTeamForm member={member} />;
}
