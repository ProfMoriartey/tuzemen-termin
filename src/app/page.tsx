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
          Tuzemen Termin Sistemine Hoş Geldiniz
        </h1>

        {!userId ? (
          <>
            <p className="mb-8 text-lg text-slate-600">
              Sisteme erişmek için lütfen giriş yapın.
            </p>
            <SignInButton mode="modal">
              <Button size="lg" className="text-lg">
                Giriş Yap
              </Button>
            </SignInButton>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="mb-4 text-lg text-slate-600">
              Güvenli bir şekilde giriş yaptınız.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              {(role === "SELLER" ||
                role === "MANAGER" ||
                role === "DEVELOPER") && (
                <Link href="/calendar">
                  <Button size="lg" className="w-full text-lg sm:w-auto">
                    Takvim
                  </Button>
                </Link>
              )}

              {(role === "SELLER" ||
                role === "MANAGER" ||
                role === "DEVELOPER") && (
                <Link href="/seller">
                  <Button size="lg" className="w-full text-lg sm:w-auto">
                    Satıcı Paneli
                  </Button>
                </Link>
              )}

              {(role === "MANAGER" || role === "DEVELOPER") && (
                <Link href="/manager">
                  <Button
                    size="lg"
                    className="w-full border border-slate-200 text-lg sm:w-auto"
                  >
                    Yönetici Paneli
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
                  Hesabınız onay bekliyor. Lütfen rolünüzü ataması için bir
                  yönetici ile iletişime geçin.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
