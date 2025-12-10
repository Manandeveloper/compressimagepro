import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/rotate-360.svg"
import Icon2 from "@/assets/images/flip-image.svg"
import Icon3 from "@/assets/images/social-media-orientation.svg"
import Icon4 from "@/assets/images/maintain-high-quality.svg"
import Icon5 from "@/assets/images/completely-browser-based-and-free-to-use.svg"
import Icon6 from "@/assets/images/Works-on-all-devices-mobile-tablet-and-desktop.svg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-rotate-img.png"
import {
  // Image,
  Minimize2,
  Type,
  Download,
  RefreshCw,
  Scaling,
  Crop,
  FileOutput,
  Wand2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
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
export default function RotateFlipImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      setProcessedImage(null);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  };

  useEffect(() => {
    if (preview) {
      applyTransformations();
    }
  }, [preview, rotation, flipH, flipV]);

  const applyTransformations = () => {
    if (!preview || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const isRotated90 = rotation === 90 || rotation === 270;
      const width = isRotated90 ? img.height : img.width;
      const height = isRotated90 ? img.width : img.height;

      canvas.width = width;
      canvas.height = height;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png");
      setProcessedImage(dataUrl);
    };
    img.src = preview;
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
    toast.success("Rotated 90° clockwise");
  };

  const rotateCounterClockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
    toast.success("Rotated 90° counter-clockwise");
  };

  const toggleFlipHorizontal = () => {
    setFlipH((prev) => !prev);
    toast.success(flipH ? "Horizontal flip removed" : "Flipped horizontally");
  };

  const toggleFlipVertical = () => {
    setFlipV((prev) => !prev);
    toast.success(flipV ? "Vertical flip removed" : "Flipped vertically");
  };

  const downloadImage = () => {
    if (!processedImage) return;
    const link = document.createElement("a");
    link.download = `rotated-${file?.name || "image.png"}`;
    link.href = processedImage;
    link.click();
    toast.success("Image downloaded!");
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProcessedImage(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };
  // const canonicalUrl = window.location.origin + "/rotate-image";
  const canonicalUrl = "https://compressimagepro.netlify.app" + "/rotate-image";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Does rotating an image reduce its quality?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, the tool maintains your original image quality during rotation and flipping."
        }
      },
      {
        "@type": "Question",
        "name": "Can I flip an image horizontally and vertically?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can flip your image in both directions with one click."
        }
      },
      {
        "@type": "Question",
        "name": "Is this rotate/flip tool free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, it is completely free with no hidden charges or watermarks."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to download software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, everything works directly in your browser—no installation required."
        }
      },
      {
        "@type": "Question",
        "name": "Can I rotate images in bulk?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Currently, the tool supports one image at a time for maximum precision."
        }
      },
      {
        "@type": "Question",
        "name": "Will my image be stored on the server?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, all processing happens locally in your browser to protect your privacy."
        }
      },
      {
        "@type": "Question",
        "name": "Does it work on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can rotate and flip images on any smartphone or tablet."
        }
      }
    ]
  };
  return (
    <div className="">
      <Helmet>
        <title>Rotate & Flip Image Online Free | JPG, PNG, WebP</title>
        <meta
          name="description"
          content="Rotate or flip your images online for free. Supports JPG, PNG, JPEG, and WebP. Fast and secure editing tool."
        />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content="Online Image Rotator & Flipper" />
        <meta
          property="og:description"
          content="Rotate and flip images with a single click. 100% free."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OGImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Online Image Rotator & Flipper" />
        <meta name="twitter:description" content="Rotate and flip images with a single click. 100% free." />
        <meta name="twitter:image" content={OGImage} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <ToolLayout
        title="Rotate image online – rotate left, right, or 360° free"
        description=""
        icon={RotateCw}
      >
        <canvas ref={canvasRef} className="hidden" />

        {!file ? (
          <FileUpload
            accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }}
            maxFiles={1}
            maxSize={20 * 1024 * 1024}
            onFilesSelected={handleFilesSelected}
            label="Upload an image"
            description="Drag and drop or click to select (max 20MB)"
            fileType="image"
          />
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={rotateCounterClockwise}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Rotate Left
              </Button>
              <Button
                variant="outline"
                onClick={rotateClockwise}
                className="gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Rotate Right
              </Button>
              <Button
                variant={flipH ? "default" : "outline"}
                onClick={toggleFlipHorizontal}
                className="gap-2"
              >
                <FlipHorizontal className="h-4 w-4" />
                Flip H
              </Button>
              <Button
                variant={flipV ? "default" : "outline"}
                onClick={toggleFlipVertical}
                className="gap-2"
              >
                <FlipVertical className="h-4 w-4" />
                Flip V
              </Button>
            </div>

            {/* Status */}
            <div className="text-center text-sm text-muted-foreground">
              Rotation: {rotation}° | Flip H: {flipH ? "Yes" : "No"} | Flip V: {flipV ? "Yes" : "No"}
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              <div className="relative max-h-[400px] max-w-full overflow-hidden rounded-lg border border-border bg-muted/30">
                {processedImage && (
                  <img
                    src={processedImage}
                    alt="Transformed preview"
                    className="max-h-[400px] w-auto object-contain"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="gradient" onClick={downloadImage} className="gap-2">
                <Download className="h-4 w-4" />
                Download Image
              </Button>
              <Button variant="outline" onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </ToolLayout>
      <div className="short-desc padding">
        <div className="container">
          <div className="content text-center">
            <p>Easily rotate or flip your images online with this fast, free, and beginner-friendly tool. Whether your photo is sideways, upside down, or simply needs a mirrored orientation, this tool provides precise rotation and flipping options. No software, no login, and no editing skills required—just upload your image and adjust its orientation in seconds.</p>
          </div>
        </div>
      </div>
      <div className="why-use padding">
        <div className="container">
          <h2 className="text-center">Why Use This Rotate & Flip Tool?</h2>
          <div className="wrap">
            <div className="single">
              <div className="icon">
                <img
                  src={Icon1}
                  alt="Instantly rotate images left, right, or 180 degrees"
                />
              </div>
              <p className="text text-center">Instantly rotate images left, right, or 180 degrees</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon2}
                  alt="Flip photos horizontally or vertically with one clic"
                />
              </div>
              <p className="text text-center">Flip photos horizontally or vertically with one click</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon3}
                  alt="Correct image orientation for social media, websites, or printing"
                />
              </div>
              <p className="text text-center">Correct image orientation for social media, websites, or printing</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon4}
                  alt="No loss of quality while rotating or flipping"
                />
              </div>
              <p className="text text-center">No loss of quality while rotating or flipping</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon5}
                  alt="100% free with no login or watermark"
                />
              </div>
              <p className="text text-center">100% free with no login or watermark</p>
            </div>
            <div className="single">
              <div className="icon">
                <img
                  src={Icon6}
                  alt="Works on mobile, tablet, and desktop"
                />
              </div>
              <p className="text text-center">Works on mobile, tablet, and desktop</p>
            </div>
          </div>
        </div>
      </div>
      <div className="advantages padding">
        <div className="container">
          <h2 className="text-center">Advantages of This Tool</h2>
          <div className="content">
            <p>This tool offers a smooth and efficient way to correct or transform your image orientation without relying on heavy software like Photoshop. It processes images directly in the browser, ensuring speed and privacy. The intuitive controls allow anyone to rotate or flip images with precision, making it ideal for photographers, eCommerce sellers, students, designers, or casual users who need quick orientation adjustments. With instant preview and high-quality output, it’s a reliable tool for both professional and personal use.</p>
          </div>
        </div>
      </div>
      <div className="features-sec padding">
        <div className="container">
          <h2 className="text-center">Comparison With Other Rotate/Flip Tools</h2>
          <div className="main-wrap">
            <div className="wrap">
              <div className="features">
                <h3>Features</h3>
                <ul>
                  <li>One-click rotate & flip</li>
                  <li>100% free with no watermark</li>
                  <li>No login required</li>
                  <li>Fast browser-based processing</li>
                  <li>Works on all devices</li>
                  <li>High-quality output</li>
                  <li>Easy for beginners</li>
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
                  <li>✘ Limited / watermark</li>
                  <li>✘ Required</li>
                  <li>✘ Slow / ads</li>
                  <li>✔ Limited</li>
                  <li>✘ Quality loss</li>
                  <li>✘ Confusing UI</li>
                </ul>
              </div>
              <div className="other-tools">
                <h3>Offline Editors</h3>
                <ul>
                  <li>✔</li>
                  <li>✘ Paid</li>
                  <li>✘</li>
                  <li>✔</li>
                  <li>✘ Computer only</li>
                  <li>✔</li>
                  <li>✘ Requires skill</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="use-case padding">
        <div className="container">
          <h2 className="text-center">How to Use the Rotate & Flip Tool</h2>
          <div className="content">
            <ul>
              <li>1. Upload Your Image</li>
              <li>2. Choose Rotate or Flip Options</li>
              <li>3. Preview the Adjusted Image</li>
              <li>4. Download the Final Version</li>
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
              <img src={faqimage} alt="rotateimage faq image" />
            </div>
            <div className="content">
              {/* <h2 className="text-center">Frequently Asked Questions</h2> */}
              <div className="faq-list">
                <div className="single">
                  <p className="question">1. Does rotating an image reduce its quality?</p>
                  <p className="answer">No, the tool maintains your original image quality during rotation and flipping.</p>
                </div>
                <div className="single">
                  <p className="question">2. Can I flip an image horizontally and vertically?</p>
                  <p className="answer">Yes, you can flip your image in both directions with one click.</p>
                </div>
                <div className="single">
                  <p className="question">3. Is this rotate/flip tool free to use?</p>
                  <p className="answer">Yes, it is completely free with no hidden charges or watermarks.</p>
                </div>
                <div className="single">
                  <p className="question">4. Do I need to download software?</p>
                  <p className="answer">No, everything works directly in your browser—no installation required.</p>
                </div>
                <div className="single">
                  <p className="question">5. Can I rotate images in bulk?</p>
                  <p className="answer">Currently, the tool supports one image at a time for maximum precision.</p>
                </div>
                <div className="single">
                  <p className="question">6. Will my image be stored on the server?</p>
                  <p className="answer">No, all processing happens locally in your browser to protect your privacy.</p>
                </div>
                <div className="single">
                  <p className="question">7. Does it work on mobile devices?</p>
                  <p className="answer">Yes, you can rotate and flip images on any smartphone or tablet.</p>
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
