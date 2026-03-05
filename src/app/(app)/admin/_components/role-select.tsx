"use client";

import { updateUserRole } from "~/server/actions/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useTransition } from "react";

export function RoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(() => {
      const typedRole = value as "PENDING" | "SELLER" | "MANAGER" | "DEVELOPER";
      updateUserRole(userId, typedRole);
    });
  }

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={handleChange}
      disabled={isPending}
    >
      <SelectTrigger className="w-35">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PENDING">Pending</SelectItem>
        <SelectItem value="SELLER">Seller</SelectItem>
        <SelectItem value="MANAGER">Manager</SelectItem>
        <SelectItem value="DEVELOPER">Developer</SelectItem>
      </SelectContent>
    </Select>
  );
}
