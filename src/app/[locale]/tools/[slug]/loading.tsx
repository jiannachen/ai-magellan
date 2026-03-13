export default function ToolDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-12 bg-muted rounded w-3/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="h-64 bg-muted rounded-2xl"></div>
              <div className="h-32 bg-muted rounded-2xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-muted rounded-2xl"></div>
              <div className="h-32 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
