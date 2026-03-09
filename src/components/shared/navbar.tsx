import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { CalendarDays } from "lucide-react";

export function Navbar() {
  return (
    <nav className="flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-slate-900"
      >
        Tuzemen Termin
      </Link>

      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="h-10 cursor-pointer rounded-md bg-[#1a1821] px-4 text-sm font-medium text-white sm:h-8 sm:px-5 sm:text-base">
              Sign In
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link href="/calendar">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-blue-600"
            >
              <CalendarDays className="h-5 w-5" />
              <span className="sr-only">Calendar</span>
            </Button>
          </Link>
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
