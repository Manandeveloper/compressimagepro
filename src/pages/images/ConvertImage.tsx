import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/Works-with-JPG,-PNG-and-WebP.svg"
import Icon2 from "@/assets/images/Maintain-high-clarity-with-smart-compression.svg"
import Icon3 from "@/assets/images/Quick-drag-and-drop-upload-with-fast-processing.svg"
import Icon4 from "@/assets/images/Works-on-all-devices-mobile-tablet-and-desktop.svg"
import Icon5 from "@/assets/images/No-installation-or-signup-required.svg"
import Icon6 from "@/assets/images/Ideal-for-web-optimization-and-compatibility.svg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-convert-image.jpg"
import {
  // Image,
  Palette,
  Minimize2,
  Type,
  Download,
  RefreshCw,
  Scaling,
  Crop,
  FileOutput,
  Wand2,
  Check,
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
  // {
  //   title: "Convert Format",
  //   description: "Convert between image formats",
  //   icon: FileOutput,
  //   href: "/image-convert",
  //   gradient: "from-orange-500 to-amber-500",
  // },
  {
    title: "Change Background",
    description: "AI Background Remover",
    icon: Palette,
    href: "/change-background",
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
const formats = [
  { id: "jpeg", name: "JPEG", ext: ".jpg", mime: "image/jpeg", description: "Best for photos" },
  { id: "png", name: "PNG", ext: ".png", mime: "image/png", description: "Supports transparency" },
  { id: "webp", name: "WebP", ext: ".webp", mime: "image/webp", description: "Modern web format" },
];

export default function ConvertImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("webp");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setConvertedUrl(null);
    }
  }, []);

  const convertImage = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const format = formats.find((f) => f.id === selectedFormat);
      if (!format) return;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              setIsProcessing(false);
              toast.success(`Converted to ${format.name} successfully!`);
            }
          },
          format.mime,
          0.95
        );
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      setIsProcessing(false);
      toast.error("Failed to convert image");
    }
  }, [file, selectedFormat]);

  const downloadImage = useCallback(() => {
    if (!convertedUrl || !file) return;

    const format = formats.find((f) => f.id === selectedFormat);
    if (!format) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}${format.ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  }, [convertedUrl, file, selectedFormat]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setConvertedUrl(null);
  };

  const currentFormat = file?.type.split("/")[1]?.toUpperCase() || "Unknown";
  const canonicalUrl = window.location.origin + "/image-convert";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What image formats can I convert?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can convert between JPG, PNG, JPEG, WEBP, BMP, and other standard formats."
        }
      },
      {
        "@type": "Question",
        "name": "Will converting an image reduce its quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In most cases, the image quality remains the same. Some formats like JPG may compress slightly, but our tool preserves maximum clarity."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert images with transparent backgrounds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, formats like PNG and WebP support transparency, and the tool preserves it during conversion."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install any software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No installation is required. Everything runs directly in your browser without downloading any software."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use this tool on mobile?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the tool is fully responsive and works smoothly on smartphones and tablets."
        }
      },
      {
        "@type": "Question",
        "name": "Is this image converter free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, converting images is completely free and does not require any sign-up or subscription."
        }
      },
      {
        "@type": "Question",
        "name": "Can I convert multiple images at once?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If batch conversion is available in your version, you can convert multiple images simultaneously with a single click."
        }
      }
    ]
  }
    ;
  return (
    <div className="">
      <Helmet>
        <title>Convert Image Online | JPG to PNG, PNG to JPG, WebP Converter</title>
        <meta
          name="description"
          content="Convert images between JPG, PNG, WebP, and more. Fast, free, and no signup required. High-quality online image converter."
        />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content="Online Image Converter" />
        <meta
          property="og:description"
          content="Convert images to JPG, PNG, or WebP with high-quality output."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OGImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Online Image Converter" />
        <meta name="twitter:description" content="Convert images to JPG, PNG, or WebP with high-quality output." />
        <meta name="twitter:image" content={OGImage} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <ToolLayout
        title="Convert image online – jpg, png, webp, svg, heic to any format"
        description=""
        icon={FileOutput}
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Upload & Settings */}
          <div className="space-y-6">
            <FileUpload
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"] }}
              onFilesSelected={handleFilesSelected}
              fileType="image"
              label="Drop your image here"
              description="Supports all common formats"
            />

            {file && (
              <div className="space-y-6 animate-slide-up">
                {/* Current Format */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Current format: </span>
                    <span className="font-semibold">{currentFormat}</span>
                  </p>
                </div>

                {/* Format Selection */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <h4 className="mb-4 text-sm font-medium">Convert to:</h4>
                  <div className="grid gap-3">
                    {formats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200",
                          selectedFormat === format.id
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-card hover:border-border"
                        )}
                      >
                        <div className="text-left">
                          <p className="font-semibold">{format.name}</p>
                          <p className="text-sm text-muted-foreground">{format.description}</p>
                        </div>
                        {selectedFormat === format.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={convertImage}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      `Convert to ${formats.find((f) => f.id === selectedFormat)?.name}`
                    )}
                  </Button>
                  <Button variant="outline" onClick={reset}>
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
                <h4 className="mb-3 text-sm font-medium">Preview</h4>
                <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
                  <img
                    src={convertedUrl || preview}
                    alt="Preview"
                    className="h-auto w-full object-contain"
                    style={{ maxHeight: "400px" }}
                  />
                  {convertedUrl && (
                    <div className="absolute right-3 top-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                      {formats.find((f) => f.id === selectedFormat)?.name}
                    </div>
                  )}
                </div>

                {convertedUrl && (
                  <Button
                    variant="gradient"
                    className="mt-4 w-full"
                    onClick={downloadImage}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download {formats.find((f) => f.id === selectedFormat)?.name}
                  </Button>
                )}
              </div>
            )}

            {!preview && (
              <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-border">
                <p className="text-muted-foreground">Upload an image to see preview</p>
              </div>
            )}
          </div>
        </div>
      </ToolLayout>
      <div className="short-desc padding">
        <div className="container">
          <div className="content text-center">
            <p>Convert your images effortlessly with the Online Image Converter. Whether you need to convert JPG to PNG, PNG to WebP, or WebP to JPEG, this tool offers fast, high-quality format conversion without compromising visual clarity. It’s designed for creators, developers, and everyday users who need reliable, format-flexible image conversion directly in their browser.</p>
          </div>
        </div>
      </div>
      <div className="why-use padding">
        <div className="container">
          <h2 className="text-center">Why Use This Image Converter Tool?</h2>
          <div className="wrap">
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt="Convert images to multiple formats like JPG, PNG, WebP, BMP, and more"
                />
              </div>
              <p className="text text-center">Convert images to multiple formats like JPG, PNG, WebP, BMP, and more</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon2}
                  alt="Maintain original image quality during conversion"
                />
              </div>
              <p className="text text-center">Maintain original image quality during conversion</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon3}
                  alt="Quick drag-and-drop upload with fast processing"
                />
              </div>
              <p className="text text-center">Quick drag-and-drop upload with fast processing</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon4}
                  alt="Works on all devices mobile, tablet, and desktop"
                />
              </div>
              <p className="text text-center">Works on all devices mobile, tablet, and desktop</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon5}
                  alt="No installation or signup required"
                />
              </div>
              <p className="text text-center">No installation or signup required</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon6}
                  alt="Ideal for web optimization and compatibility"
                />
              </div>
              <p className="text text-center">Ideal for web optimization and compatibility</p>
            </div>
          </div>
        </div>
      </div>
      <div className="advantages padding">
        <div className="container">
          <h2 className="text-center">Advantages of This Tool</h2>
          <div className="content">
            <p>This image converter delivers a smooth and efficient conversion experience by combining high accuracy with minimal image distortion. Unlike many online tools that compress images aggressively, this converter preserves color accuracy, transparency, and sharpness across formats. It simplifies the process for designers, developers, photographers, and marketers by offering multiple format outputs in one place—without installing bulky software. Whether you're optimizing images for websites, apps, or print, the tool ensures consistent quality in just a few clicks.</p>
          </div>
        </div>
      </div>
      <div className="features-sec padding">
        <div className="container">
          <h2 className="text-center">Comparison With Other Image Conversion Tools</h2>
          <div className="main-wrap">
            <div className="wrap">
              <div className="features">
                <h3>Features</h3>
                <ul>
                  <li>Supports multiple formats</li>
                  <li>Maintains image quality</li>
                  <li>Browser-based (no install)</li>
                  <li>Fast conversion speed</li>
                  <li>Free to use</li>
                  <li>Works on all devices</li>
                  <li>Transparency support (PNG/WebP)</li>
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
                  <li>Limited formats</li>
                  <li>✘ May lower quality</li>
                  <li>✔</li>
                  <li>✘ Slower</li>
                  <li>✘ Subscription needed</li>
                  <li>✘ Not always mobile-friendly</li>
                  <li>✘ Sometimes lost</li>
                </ul>
              </div>
              <div className="other-tools">
                <h3>Offline Editors</h3>
                <ul>
                  <li>✔</li>
                  <li>✔</li>
                  <li>✘</li>
                  <li>✔</li>
                  <li>✘ Paid software</li>
                  <li>✔</li>
                  <li>✔</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="use-case padding">
        <div className="container">
          <h2 className="text-center">How to Use the Image Converter</h2>
          <div className="content">
            <ul>
              <li>1. Upload Your Image.</li>
              <li>2. Choose the Output Format</li>
              <li>3. Convert the Image</li>
              <li>4. Download the Converted File</li>
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
                  <p className="question">1. What image formats can I convert?</p>
                  <p className="answer">You can convert between JPG, PNG, JPEG, WEBP, BMP, and other standard formats.</p>
                </div>
                <div className="single">
                  <p className="question">2. Will converting an image reduce its quality?</p>
                  <p className="answer">In most cases, the image quality remains the same. Some formats like JPG may compress slightly, but our tool preserves maximum clarity.</p>
                </div>
                <div className="single">
                  <p className="question">3. Can I convert images with transparent backgrounds?</p>
                  <p className="answer">Yes, formats like PNG and WebP support transparency, and the tool preserves it.</p>
                </div>
                <div className="single">
                  <p className="question">4. Do I need to install any software?</p>
                  <p className="answer">No installation is required. Everything runs directly in your browser.</p>
                </div>
                <div className="single">
                  <p className="question">5. Can I use this tool on mobile?</p>
                  <p className="answer">Yes, the tool works smoothly on smartphones and tablets.</p>
                </div>
                <div className="single">
                  <p className="question">6. Is this image converter free?</p>
                  <p className="answer">Yes, converting images is completely free and doesn’t require sign-up.</p>
                </div>
                <div className="single">
                  <p className="question">7. Can I convert multiple images at once?</p>
                  <p className="answer">If your version supports batch conversion, you can convert multiple images simultaneously.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="related-image padding">
        <div className="container">
          <h2 className="text-center">
            Other Free Image Editing Tools
          </h2>
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
