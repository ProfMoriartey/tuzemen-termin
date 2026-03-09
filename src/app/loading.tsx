import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm font-medium text-slate-500">Loading...</p>
    </div>
  );
}
