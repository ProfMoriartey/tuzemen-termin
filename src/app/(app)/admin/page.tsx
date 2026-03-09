import { requireRoles } from "~/server/check-role";
import { db } from "~/server/db";
import { RoleSelect } from "~/components/admin/role-select";
import { DeleteUserButton } from "~/components/admin/delete-user-button";

export default async function AdminPage() {
  await requireRoles(["DEVELOPER"]);

  const allUsers = await db.query.users.findMany();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col p-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <div className="flex flex-col gap-4">
        {allUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-bold">
                {user.name}
                {user.username && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    @{user.username}
                  </span>
                )}
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <RoleSelect userId={user.id} currentRole={user.role} />
              <DeleteUserButton targetUserId={user.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
