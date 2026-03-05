import { UserButton } from "@clerk/nextjs";

export default function WaitingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-semibold">Account Pending</h1>
        <p className="mb-8 text-slate-600">
          Your account requires developer approval. Please check back later or
          contact the team.
        </p>
        <UserButton />
      </div>
    </div>
  );
}
