import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();
  let role = null;

  if (userId) {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    role = userRecord?.role;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-slate-900">
          Welcome to Tuzemen
        </h1>

        {!userId ? (
          <>
            <p className="mb-8 text-lg text-slate-600">
              Please sign in to access the system.
            </p>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg">
                Sign In
              </Button>
            </SignInButton>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="mb-4 text-lg text-slate-600">
              You are securely signed in.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              {(role === "SELLER" ||
                role === "MANAGER" ||
                role === "DEVELOPER") && (
                <Link href="/calendar">
                  <Button size="lg" className="w-full text-lg sm:w-auto">
                    Calendar
                  </Button>
                </Link>
              )}

              {(role === "SELLER" ||
                role === "MANAGER" ||
                role === "DEVELOPER") && (
                <Link href="/seller">
                  <Button size="lg" className="w-full text-lg sm:w-auto">
                    Seller Dashboard
                  </Button>
                </Link>
              )}

              {(role === "MANAGER" || role === "DEVELOPER") && (
                <Link href="/manager">
                  <Button
                    size="lg"
                    className="w-full border border-slate-200 text-lg sm:w-auto"
                  >
                    Manager Dashboard
                  </Button>
                </Link>
              )}

              {role === "DEVELOPER" && (
                <Link href="/admin">
                  <Button size="lg" className="w-full text-lg sm:w-auto">
                    Admin Dashboard
                  </Button>
                </Link>
              )}

              {role === "PENDING" && (
                <p className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
                  Your account is pending approval. Please contact an
                  administrator to assign your role.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
