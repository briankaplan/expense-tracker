import { Skeleton } from "@/components/ui/Skeleton";

export default function NexusLoading() {
  return (
    <div className="container mx-auto p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
} 