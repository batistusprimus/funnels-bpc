import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function FunnelCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="container py-8">
      <div className="mb-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FunnelCardSkeleton />
        <FunnelCardSkeleton />
        <FunnelCardSkeleton />
      </div>
    </div>
  );
}

export function FormLoader() {
  return (
    <Card className="p-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-12 w-32 ml-auto" />
      </div>
    </Card>
  );
}

