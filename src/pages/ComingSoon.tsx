import { useLocation } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  const location = useLocation();
  const toolName = location.pathname.split("/").pop()?.replace(/-/g, " ") || "Tool";

  return (
    <div className="animate-fade-in">
      <Link to="/">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold capitalize text-foreground">
          {toolName}
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          This tool is currently under development. We're working hard to bring you
          this feature soon!
        </p>
        <div className="mt-8 flex gap-4">
          <Link to="/">
            <Button variant="gradient">
              Explore Other Tools
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
