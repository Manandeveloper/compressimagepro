import {
  Image,
  Video,
  FileText,
  Minimize2,
  Scaling,
  Crop,
  FileOutput,
  Wand2,
  Palette,
  RotateCcw,
  Type,
  Scissors,
  Combine,
  Play,
  Music,
  Clapperboard,
  FileType,
  FileEdit,
  PenTool,
  Stamp,
  Merge,
  Split,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import { ToolCard } from "@/components/shared/ToolCard";

const imageTools = [
  {
    title: "Compress Image",
    description: "Reduce file size while maintaining quality",
    icon: Minimize2,
    href: "/image-compress",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Resize Image",
    description: "Change dimensions with precision",
    icon: Scaling,
    href: "/image-resize",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Crop Image",
    description: "Crop to perfect dimensions",
    icon: Crop,
    href: "/image-crop",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Convert Format",
    description: "Convert between image formats",
    icon: FileOutput,
    href: "/image-convert",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Remove Background",
    description: "AI-powered background removal",
    icon: Wand2,
    href: "/remove-background",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Add Watermark",
    description: "Protect your images with text",
    icon: Type,
    href: "/image-watermark",
    gradient: "from-indigo-500 to-blue-500",
  },
];

const videoTools = [
  {
    title: "Convert Video",
    description: "Convert between video formats",
    icon: FileType,
    href: "/videos/convert",
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Trim Video",
    description: "Cut videos to perfect length",
    icon: Scissors,
    href: "/videos/trim",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Merge Videos",
    description: "Combine multiple videos into one",
    icon: Combine,
    href: "/videos/merge",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Video to GIF",
    description: "Create animated GIFs from video",
    icon: Play,
    href: "/videos/to-gif",
    gradient: "from-purple-500 to-pink-500",
  },
];

const pdfTools = [
  {
    title: "PDF to Word",
    description: "Convert PDF to editable Word documents",
    icon: FileType,
    href: "/pdfs/to-word",
    gradient: "from-blue-600 to-blue-400",
  },
  {
    title: "Edit PDF",
    description: "Add text, images, and annotations",
    icon: FileEdit,
    href: "/pdfs/edit",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    title: "Sign PDF",
    description: "Add digital signatures easily",
    icon: PenTool,
    href: "/pdfs/sign",
    gradient: "from-slate-600 to-slate-400",
  },
  {
    title: "Merge PDFs",
    description: "Combine multiple PDFs into one",
    icon: Merge,
    href: "/pdfs/merge",
    gradient: "from-teal-500 to-cyan-500",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Smart tools that understand your content",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process files in seconds, not minutes",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Files processed locally, never stored",
  },
];

import { Helmet } from "react-helmet-async";
const canonicalUrl = window.location.origin;
export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Free Online Image Tools – Compress, Resize, Convert & Edit</title>
        <meta
          name="description"
          content="Use free online image editing tools to compress, resize, convert, crop, rotate, remove background, add watermark, and more. Fast, secure, and no signup required."
        />
        <link rel="canonical" href={canonicalUrl} />
        {/* OG Tags */}
        <meta property="og:title" content="Free Online Image Editing Toolkit – Compress, Resize & Convert" />
        <meta
          property="og:description"
          content="Access a complete set of free image tools to compress, resize, convert, crop, edit backgrounds, and enhance your visuals—instantly and without login."
        />
        <meta property="og:url" content={canonicalUrl} />
        {/* <meta property="og:image" content={OGImage} /> */}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Image Editing Toolkit – Compress, Resize & Convert" />
        <meta name="twitter:description" content="Access a complete set of free image tools to compress, resize, convert, crop, edit backgrounds, and enhance your visuals—instantly and without login." />
        {/* <meta name="twitter:image" content={OGImage} /> */}

      </Helmet>
      <div className="animate-fade-in space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 lg:p-12">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-primary-foreground lg:text-4xl">
              Welcome to Compress Image Pro
            </h1>
            <p className="mt-3 max-w-xl text-lg text-primary-foreground/90">
              Your all-in-one toolkit for images, videos, and PDFs. Transform your media
              with powerful, easy-to-use tools.
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">
                      {feature.title}
                    </p>
                    <p className="text-xs text-primary-foreground/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>

        {/* Image Tools */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Image className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Image Tools</h2>
              <p className="text-sm text-muted-foreground">
                Edit, convert, and enhance your images
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imageTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        {/* Video Tools */}
        {/* <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Video className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Video Tools</h2>
                <p className="text-sm text-muted-foreground">
                  Transform and edit your videos
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {videoTools.map((tool) => (
                <ToolCard key={tool.href} {...tool} />
              ))}
            </div>
          </section> */}

        {/* PDF Tools */}
        {/* <section>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">PDF Tools</h2>
                <p className="text-sm text-muted-foreground">
                  Edit, convert, and manage your PDFs
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pdfTools.map((tool) => (
                <ToolCard key={tool.href} {...tool} />
              ))}
            </div>
          </section> */}
      </div>
    </>
  );
}
