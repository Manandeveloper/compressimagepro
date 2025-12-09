import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Image,
  Video,
  FileText,
  LayoutDashboard,
  ChevronDown,
  Crop,
  Scaling,
  FileOutput,
  Scissors,
  Palette,
  RotateCcw,
  Type,
  Minimize2,
  Play,
  Combine,
  Music,
  Clapperboard,
  FileType,
  FileEdit,
  Stamp,
  PenTool,
  Merge,
  Split,
  Menu,
  X,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Images",
    icon: Image,
    items: [
      { title: "Compress Image", href: "/image-compress", icon: Minimize2 },
      { title: "Resize Image", href: "/image-resize", icon: Scaling },
      { title: "Crop Image", href: "/image-crop", icon: Crop },
      { title: "Convert Format", href: "/image-convert", icon: FileOutput },
      { title: "Remove Background", href: "/remove-background", icon: Wand2 },
      { title: "Change Background", href: "/change-background", icon: Palette },
      { title: "Rotate / Flip", href: "/rotate-image", icon: RotateCcw },
      { title: "Add Watermark", href: "/image-watermark", icon: Type },
    ],
  },
  // {
  //   title: "Videos",
  //   icon: Video,
  //   items: [
  //     { title: "Convert Video", href: "/videos/convert", icon: FileType },
  //     { title: "Trim Video", href: "/videos/trim", icon: Scissors },
  //     { title: "Resize Video", href: "/videos/resize", icon: Scaling },
  //     { title: "Merge Videos", href: "/videos/merge", icon: Combine },
  //     { title: "Video to GIF", href: "/videos/to-gif", icon: Play },
  //     { title: "Add Watermark", href: "/videos/watermark", icon: Type },
  //     { title: "Add Music", href: "/videos/music", icon: Music },
  //     { title: "Create Slideshow", href: "/videos/slideshow", icon: Clapperboard },
  //   ],
  // },
  // {
  //   title: "PDFs",
  //   icon: FileText,
  //   items: [
  //     { title: "PDF to Word", href: "/pdfs/to-word", icon: FileType },
  //     { title: "Edit PDF", href: "/pdfs/edit", icon: FileEdit },
  //     { title: "Sign PDF", href: "/pdfs/sign", icon: PenTool },
  //     { title: "Add Watermark", href: "/pdfs/watermark", icon: Stamp },
  //     { title: "Merge PDFs", href: "/pdfs/merge", icon: Merge },
  //     { title: "Split PDF", href: "/pdfs/split", icon: Split },
  //     { title: "Compress PDF", href: "/pdfs/compress", icon: Minimize2 },
  //   ],
  // },
];

export function AppSidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["Images", "Videos", "PDFs"]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((g) => g !== title) : [...prev, title]
    );
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => location.pathname === item.href);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
          <Wand2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-sidebar-foreground">MediaWizard</span>
          <span className="text-xs text-muted-foreground">Pro Tools</span>
        </div>
      </div>

      {/* Dashboard Link */}
      <div className="p-3">
        <NavLink to="/">
          {({ isActive }) => (
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </div>
          )}
        </NavLink>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navigation.map((group) => {
          const isExpanded = expandedGroups.includes(group.title);
          const isActive = isGroupActive(group);

          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <div className="flex items-center gap-3">
                  <group.icon className="h-5 w-5" />
                  {group.title}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded ? "rotate-180" : ""
                  )}
                />
              </button>

                <div className="ml-4 space-y-1 animate-fade-in">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {({ isActive }) => (
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-200",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.title}
                        </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              {/* {isExpanded && (
              )} */}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {/* <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-4">
          <p className="text-xs font-medium text-foreground">Free Plan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upgrade for unlimited access
          </p>
          <Button size="sm" className="mt-3 w-full" variant="gradient">
            Upgrade Now
          </Button>
        </div>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-72 border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
