import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children: ReactNode;
  backHref?: string;
}

export function ToolLayout({
  title,
  description,
  icon: Icon,
  children,
  backHref = "/",
}: ToolLayoutProps) {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link to={backHref}>
          <Button variant="ghost" size="sm" className="mb-4 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="title-wrap text-center">
          <h1 className="">
            {title}
          </h1>
          <p className="">{description}</p>
        </div>
        {/* <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg">
            <Icon className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
          </div>
        </div> */}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:p-8">
        {children}
      </div>
    </div>
  );
}
