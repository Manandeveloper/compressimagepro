import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/reduce-image-size.jpg"
import Icon2 from "@/assets/images/improve-seo-score.jpg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-remove-bg-image.png"
import {
  Image,
  Palette,
  Minimize2,
  Type,
  Download,
  RefreshCw,
  Scaling,
  Crop,
  FileOutput,
  Wand2,
  Sparkles,
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
  // {
  //   title: "Remove Background",
  //   description: "AI-powered background removal",
  //   icon: Wand2,
  //   href: "/remove-background",
  //   gradient: "from-pink-500 to-rose-500",
  // },
  {
    title: "Change Background",
    description: "AI Background Remover",
    icon: Palette,
    href: "/change-background",
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
export default function RemoveBackground() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResultUrl(null);
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeBackground = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Convert file to base64
      const imageBase64 = await fileToBase64(file);

      toast.info("Processing with AI... This may take a moment.", {
        duration: 5000,
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: { imageBase64 },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to process image");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.imageUrl) {
        setResultUrl(data.imageUrl);
        toast.success("Background removed successfully!");
      } else {
        throw new Error("No image returned from AI");
      }
    } catch (error) {
      console.error("Error removing background:", error);
      const message = error instanceof Error ? error.message : "Failed to remove background";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [file]);

  const downloadImage = useCallback(() => {
    if (!resultUrl || !file) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `no-bg_${file.name.replace(/\.[^/.]+$/, "")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  }, [resultUrl, file]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
  };
  const canonicalUrl = window.location.origin + "/remove-background";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What file formats are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most common image formats like JPG, PNG, and WebP are supported."
        }
      },
      {
        "@type": "Question",
        "name": "Does the tool maintain image quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the tool preserves the original resolution and sharpness while removing the background."
        }
      },
      {
        "@type": "Question",
        "name": "Can this remove complex backgrounds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the AI engine handles detailed backgrounds, hair, fur, shadows, and soft edges effectively."
        }
      },
      {
        "@type": "Question",
        "name": "Is this tool free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can remove backgrounds without any subscription or software installation."
        }
      },
      {
        "@type": "Question",
        "name": "Will the tool work on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. The tool is fully responsive and works smoothly on mobile, tablet, and desktop."
        }
      },
      {
        "@type": "Question",
        "name": "Can I edit the image after the background is removed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If your platform supports editing tools, you can refine edges or adjust the cutout manually."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download the result in PNG format?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the removed-background image is saved as a PNG to support transparency."
        }
      }
    ]
  };
  return (
    <div className="">
      <Helmet>
        <title>Remove background from image free | ai background remover</title>
        <meta
          name="description"
          content="Remove background from photos using AI. 100% free, no login required. Upload JPG or PNG and remove backgrounds instantly."
        />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content="Free AI Background Remover" />
        <meta
          property="og:description"
          content="Remove backgrounds from images with one click. Fast and free."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OGImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free AI Background Remover" />
        <meta name="twitter:description" content="Remove backgrounds from images with one click. Fast and free." />
        <meta name="twitter:image" content={OGImage} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <ToolLayout
        title="Remove background online – free ai background eraser tool"
        description=""
        icon={Wand2}
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Upload & Actions */}
          <div className="space-y-6">
            <FileUpload
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
              onFilesSelected={handleFilesSelected}
              fileType="image"
              label="Drop your image here"
              description="PNG, JPG, JPEG or WebP"
            />

            {file && (
              <div className="space-y-6 animate-slide-up">
                {/* AI Info */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-primary">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">AI-Powered Removal</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Our AI analyzes your image and removes the background with precision,
                        preserving fine details like hair and edges.
                      </p>
                    </div>
                  </div>
                </div>

                {/* File Info */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <h4 className="mb-2 text-sm font-medium">File Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="truncate ml-2 font-medium">{file.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={removeBackground}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Removing Background...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Remove Background
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={reset} disabled={isProcessing}>
                    Reset
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            {preview && (
              <div className="animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    {resultUrl ? "Result (Transparent Background)" : "Original Image"}
                  </h4>
                  {resultUrl && (
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                      AI Processed
                    </span>
                  )}
                </div>

                {/* Checkerboard background to show transparency */}
                <div
                  className="relative overflow-hidden rounded-xl border border-border"
                  style={{
                    backgroundImage: resultUrl
                      ? `linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                       linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                       linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                       linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)`
                      : undefined,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    backgroundColor: resultUrl ? "#fff" : "hsl(var(--muted) / 0.3)",
                  }}
                >
                  <img
                    src={resultUrl || preview}
                    alt="Preview"
                    className="h-auto w-full object-contain"
                    style={{ maxHeight: "400px" }}
                  />
                  {resultUrl && (
                    <div className="absolute right-3 top-3 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                      Background Removed
                    </div>
                  )}
                </div>

                {resultUrl && (
                  <Button
                    variant="gradient"
                    className="mt-4 w-full"
                    onClick={downloadImage}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG (Transparent)
                  </Button>
                )}
              </div>
            )}

            {!preview && (
              <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Wand2 className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Upload an image</p>
                  <p className="text-sm text-muted-foreground">
                    AI will remove the background automatically
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ToolLayout>
      <div className="short-desc padding">
        <div className="container">
          <div className="content text-center">
            <p>Remove the background from any image instantly using our AI-powered Background Remover. Designed for creators, businesses, and casual users, this tool delivers clean, precise cutouts without needing complex software. Whether you’re editing product photos, profile images, or social media graphics, it ensures professional-quality results within seconds.</p>
          </div>
        </div>
      </div>
      <div className="why-use padding">
        <div className="container">
          <h2 className="text-center">Why Use This Background Removal Tool?</h2>
          <div className="wrap">
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt=""
                />
              </div>
              <p className="text text-center">AI-powered accuracy for clean and sharp cutouts</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon2}
                  alt=""
                />
              </div>
              <p className="text text-center">Works on product photos, portraits, graphics, and logos</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt=""
                />
              </div>
              <p className="text text-center">No Photoshop or editing skills required</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt=""
                />
              </div>
              <p className="text text-center">Fast processing with high-quality results</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt=""
                />
              </div>
              <p className="text text-center">Automatic detection of edges, hair, and transparent areas</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt=""
                />
              </div>
              <p className="text text-center">Easy-to-use drag-and-drop interface</p>
            </div>
          </div>
        </div>
      </div>
      <div className="advantages padding">
        <div className="container">
          <h2 className="text-center">What Makes This Background Remover Stand Out</h2>
          <div className="content">
            <p>This tool delivers studio-quality background removal using smart AI segmentation that captures even the most detailed edges—like hair, fur, and semi-transparent elements. Unlike manual editing tools that require skill and time, this automatic solution completes the job within seconds. It’s ideal for eCommerce sellers, designers, marketers, and social media creators who need consistent, clean images for websites, ads, thumbnails, and branding. With fast processing and high-resolution downloads, it ensures professional results without complicated workflows.</p>
          </div>
        </div>
      </div>
      <div className="features-sec padding">
        <div className="container">
          <h2 className="text-center">H2: Comparison With Other Background Removal Tools</h2>
          <div className="main-wrap">
            <div className="wrap">
              <div className="features">
                <h3>Features</h3>
                <ul>
                  <li>Automatic AI background removal</li>
                  <li>Handles hair & complex edges</li>
                  <li>No installation required</li>
                  <li>Free to use</li>
                  <li>Fast processing</li>
                  <li>Clean cutout accuracy</li>
                  <li>Works on all devices</li>
                </ul>
              </div>
              <div className="our-tool">
                <h3>This Tool</h3>
                <ul>
                  <li>✔</li>
                  <li>✔</li>
                  <li>✔</li>
                  <li>✔</li>
                  <li>✔</li>
                  <li>✔</li>
                  <li>✔</li>
                </ul>
              </div>
              <div className="other-tools">
                <h3>Other Online Tools</h3>
                <ul>
                  <li>✔</li>
                  <li>✘ Inconsistent</li>
                  <li>✔</li>
                  <li>✘ Limited free features</li>
                  <li>✘ Slow or limited</li>
                  <li>✘ Rough edges</li>
                  <li>✘ Some don’t support mobile</li>
                </ul>
              </div>
              <div className="other-tools">
                <h3>Offline Editors (Photoshop, GIMP)</h3>
                <ul>
                  <li>✘ Manual selection required</li>
                  <li>✔</li>
                  <li>✘ Requires download</li>
                  <li>✘ Paid subscription</li>
                  <li>✔</li>
                  <li>✔ High accuracy</li>
                  <li>✔</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="use-case padding">
        <div className="container">
          <h2 className="text-center">How to Use the Background Remover</h2>
          <div className="content">
            <ul>
              <li>1. Upload Your Image</li>
              <li>2. AI Removes the Background Automatically</li>
              <li>3. Review & Adjust (If Your Tool Supports Editing)</li>
              <li>4. Download the Transparent Image</li>
              <li>5. Use It Anywhere</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="faq-sec padding">
        <div className="container">
          <div className="wrap">
            <div className="image">
              <p className="small-title">Still have questions?</p>
              <p className="big-title">Relax because we always will be here for you</p>
              <img src={faqimage} alt="" />
            </div>
            <div className="content">
              {/* <h2 className="text-center">Frequently Asked Questions</h2> */}
              <div className="faq-list">
                <div className="single">
                  <p className="question">1. What file formats are supported?</p>
                  <p className="answer">Most common image formats like JPG, PNG, and WebP are supported.</p>
                </div>
                <div className="single">
                  <p className="question">2. Does the tool maintain image quality?</p>
                  <p className="answer">Yes, the tool preserves the original resolution and sharpness while removing the background.</p>
                </div>
                <div className="single">
                  <p className="question">3. Can this remove complex backgrounds?</p>
                  <p className="answer">Yes, the AI engine handles detailed backgrounds, hair, fur, shadows, and soft edges effectively.</p>
                </div>
                <div className="single">
                  <p className="question">4. Is this tool free to use?</p>
                  <p className="answer">Yes, you can remove backgrounds without any subscription or software installation.</p>
                </div>
                <div className="single">
                  <p className="question">5. Will the tool work on mobile devices?</p>
                  <p className="answer">Absolutely. The tool is fully responsive and works smoothly on mobile, tablet, and desktop.</p>
                </div>
                <div className="single">
                  <p className="question">6. Can I edit the image after the background is removed?</p>
                  <p className="answer">If your platform supports editing tools, you can refine edges or adjust the cutout manually.</p>
                </div>
                <div className="single">
                  <p className="question">7. Can I download the result in PNG format?</p>
                  <p className="answer">Yes, the removed-background image is saved as a PNG to support transparency.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="related-image padding">
        <h2 className="text-center">
          Other Free Image Editing Tools
        </h2>
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imageTools.map((tool) => (
              <ToolCard key={tool.href} {...tool} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
