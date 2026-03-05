import { db } from "~/server/db";
import { RoleSelect } from "./_components/role-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default async function AdminPage() {
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
                  <RoleSelect userId={user.id} currentRole={user.role} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
