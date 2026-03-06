import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";

export function Navbar() {
  return (
    <nav className="flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
      <Link
        href="/"
        className="text-xl font-bold tracking-tight text-slate-900"
      >
        Tuzemen
      </Link>

      <div>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="h-10 cursor-pointer rounded-md bg-[#1a1821] px-4 text-sm font-medium text-white sm:h-8 sm:px-5 sm:text-base">
              Sign In
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
