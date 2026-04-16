import { prisma } from "@/lib/prisma";
import { getUsers } from "@/app/actions/users";
import UserManagementClient from "./UserManagementClient";
import { getSession } from "@/app/actions/auth";

export default async function AdminUsersPage() {
  const users = await getUsers();
  const session = await getSession();

  return (
    <div className="space-y-8 md:space-y-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-secondary italic uppercase mb-2">Benutzerverwaltung</h1>
        <p className="text-slate-400 font-medium italic">Administratoren hinzufügen, löschen oder Passwort ändern.</p>
      </div>

      <UserManagementClient users={users} currentUserId={session?.userId} />
    </div>
  );
}
