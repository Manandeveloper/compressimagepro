import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient?: string;
  className?: string;
}

export function ToolCard({
  title,
  description,
  icon: Icon,
  href,
  gradient = "from-primary to-accent",
  className,
}: ToolCardProps) {
  return (
    <Link to={href} className={cn("group block", className)}>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
        {/* Background gradient on hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-5",
          gradient
        )} />
        
        <div className="relative">
          {/* Icon */}
          <div className={cn(
            "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-transform duration-300 group-hover:scale-110",
            gradient
          )}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>

          {/* Arrow */}
          <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
            Open tool
            <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
