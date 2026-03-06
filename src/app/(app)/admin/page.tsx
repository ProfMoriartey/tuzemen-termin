import { db } from "~/server/db";
import { RoleSelect } from "../../../components/admin/role-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { DeleteUserButton } from "~/components/admin/delete-user-button";
import { requireRoles } from "~/server/check-role";
import { auth } from "@clerk/nextjs/server";

export default async function AdminPage() {
  await requireRoles(["DEVELOPER"]);

  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const allUsers = await db.query.users.findMany({
    orderBy: (users, { desc }) => desc(users.role),
  });

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name ?? "No Name"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <RoleSelect userId={user.id} currentRole={user.role} />
                    <DeleteUserButton targetUserId={user.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
