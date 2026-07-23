export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse p-4 md:p-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-3 w-full">
          <div className="h-6 w-24 bg-muted rounded-md"></div>
          <div className="h-10 w-64 bg-muted rounded-md"></div>
          <div className="h-4 w-96 bg-muted rounded-md max-w-[80%]"></div>
        </div>
        <div className="h-10 w-full sm:w-64 bg-muted rounded-md"></div>
      </div>
      
      <div className="h-[500px] w-full bg-card/50 border border-border/50 rounded-xl"></div>
    </div>
  );
}
