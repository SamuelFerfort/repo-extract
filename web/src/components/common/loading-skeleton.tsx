import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LoadingSkeleton() {
  const categories = ["Security", "Code Quality", "Architecture", "Performance"];
  
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="h-10 flex items-center space-x-4 pb-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Card key={category} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-6 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-2 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[85%]" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[88%]" />
                    <Skeleton className="h-4 w-[92%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}