import { useState, useCallback, useEffect, useRef } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/reduce-image-size.jpg"
import Icon2 from "@/assets/images/improve-seo-score.jpg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-watermark-image.png"
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
      title: "Change Background",
      description: "AI Background Remover",
      icon: Palette,
      href: "/change-background",
      gradient: "from-indigo-500 to-blue-500",
   },
   // {
   //    title: "Add Watermark",
   //    description: "Protect your images with text",
   //    icon: Type,
   //    href: "/image-watermark",
   //    gradient: "from-indigo-500 to-blue-500",
   // },
];
const positions = [
   { name: "Top Left", value: "top-left" },
   { name: "Top Center", value: "top-center" },
   { name: "Top Right", value: "top-right" },
   { name: "Center", value: "center" },
   { name: "Bottom Left", value: "bottom-left" },
   { name: "Bottom Center", value: "bottom-center" },
   { name: "Bottom Right", value: "bottom-right" },
];

const fonts = [
   { name: "Sans-serif", value: "Arial, sans-serif" },
   { name: "Serif", value: "Georgia, serif" },
   { name: "Monospace", value: "Courier New, monospace" },
];

export default function AddWatermark() {
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string | null>(null);
   const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
   const [text, setText] = useState("© Your Name");
   const [fontSize, setFontSize] = useState([32]);
   const [opacity, setOpacity] = useState([70]);
   const [position, setPosition] = useState("bottom-right");
   const [font, setFont] = useState("Arial, sans-serif");
   const [color, setColor] = useState("#ffffff");
   const [isProcessing, setIsProcessing] = useState(false);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   const handleFilesSelected = useCallback((files: File[]) => {
      if (files.length > 0) {
         const selectedFile = files[0];
         setFile(selectedFile);
         setPreview(URL.createObjectURL(selectedFile));
         setWatermarkedUrl(null);
      }
   }, []);

   const getPosition = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, textWidth: number) => {
      const padding = 20;
      const textHeight = fontSize[0];

      switch (position) {
         case "top-left":
            return { x: padding, y: padding + textHeight };
         case "top-center":
            return { x: (canvas.width - textWidth) / 2, y: padding + textHeight };
         case "top-right":
            return { x: canvas.width - textWidth - padding, y: padding + textHeight };
         case "center":
            return { x: (canvas.width - textWidth) / 2, y: canvas.height / 2 };
         case "bottom-left":
            return { x: padding, y: canvas.height - padding };
         case "bottom-center":
            return { x: (canvas.width - textWidth) / 2, y: canvas.height - padding };
         case "bottom-right":
         default:
            return { x: canvas.width - textWidth - padding, y: canvas.height - padding };
      }
   };

   const addWatermark = useCallback(async () => {
      if (!file || !text) return;

      setIsProcessing(true);
      try {
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");
         const img = new Image();

         img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            if (!ctx) return;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Configure text
            ctx.font = `${fontSize[0]}px ${font}`;
            ctx.fillStyle = color;
            ctx.globalAlpha = opacity[0] / 100;

            // Get text width and position
            const textWidth = ctx.measureText(text).width;
            const pos = getPosition(ctx, canvas, textWidth);

            // Add text shadow for better visibility
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            // Draw text
            ctx.fillText(text, pos.x, pos.y);

            canvas.toBlob(
               (blob) => {
                  if (blob) {
                     const url = URL.createObjectURL(blob);
                     setWatermarkedUrl(url);
                     setIsProcessing(false);
                     toast.success("Watermark added successfully!");
                  }
               },
               file.type || "image/png",
               0.95
            );
         };

         img.src = URL.createObjectURL(file);
      } catch (error) {
         setIsProcessing(false);
         toast.error("Failed to add watermark");
      }
   }, [file, text, fontSize, opacity, position, font, color]);

   const downloadImage = useCallback(() => {
      if (!watermarkedUrl || !file) return;

      const link = document.createElement("a");
      link.href = watermarkedUrl;
      const ext = file.name.split(".").pop();
      link.download = `watermarked_${file.name.replace(/\.[^/.]+$/, "")}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
   }, [watermarkedUrl, file]);

   const reset = () => {
      setFile(null);
      setPreview(null);
      setWatermarkedUrl(null);
      setText("© Your Name");
   };
   const canonicalUrl = window.location.origin + "/image-watermark";
   const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
         {
            "@type": "Question",
            "name": "Does this tool add its own watermark?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "No, the tool never adds any watermark or branding. Only your selected watermark will appear."
            }
         },
         {
            "@type": "Question",
            "name": "Can I upload my own logo as a watermark?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, you can upload PNG logos with transparency for best results."
            }
         },
         {
            "@type": "Question",
            "name": "Will watermarking reduce image quality?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "No, the output image maintains the same quality as the original."
            }
         },
         {
            "@type": "Question",
            "name": "Is this tool free to use?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, it is completely free with no restrictions or premium requirements."
            }
         },
         {
            "@type": "Question",
            "name": "Are my images stored on the server?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "No, all processing happens locally in your browser for maximum privacy. Your images never leave your device."
            }
         },
         {
            "@type": "Question",
            "name": "Can I create multiple watermarked versions?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, you can edit and download unlimited versions without any limits."
            }
         },
         {
            "@type": "Question",
            "name": "Does it work on mobile devices?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, this watermark tool works smoothly on all iOS, Android, and tablet devices."
            }
         }
      ]
   };
   return (
      <div className="">
         <Helmet>
            <title>Add watermark to image online | text & logo watermark</title>
            <link rel="canonical" href={canonicalUrl} />
            <meta
               name="description"
               content="Add text or logo watermark to your images online for free. Protect your images with customizable watermark styles."
            />

            <meta property="og:title" content="Free Image Watermark Tool" />
            <meta property="og:description" content="Add watermarks to PNG, JPG, and WebP images instantly." />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={OGImage} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Free Image Watermark Tool" />
            <meta name="twitter:description" content="Add watermarks to PNG, JPG, and WebP images instantly." />
            <meta name="twitter:image" content={OGImage} />

            <script type="application/ld+json">
               {JSON.stringify(faqSchema)}
            </script>
         </Helmet>

         <ToolLayout
            title="Add watermark to image online text & logo watermark free"
            description=""
            icon={Type}
         >
            <div className="grid gap-8 lg:grid-cols-2">
               {/* Left: Upload & Settings */}
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
                        {/* Text Settings */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                           <h4 className="text-sm font-medium">Watermark Text</h4>
                           <Input
                              value={text}
                              onChange={(e) => setText(e.target.value)}
                              placeholder="Enter watermark text"
                           />

                           <div>
                              <div className="mb-2 flex items-center justify-between">
                                 <label className="text-sm text-muted-foreground">Font Size</label>
                                 <span className="text-sm font-semibold">{fontSize[0]}px</span>
                              </div>
                              <Slider
                                 value={fontSize}
                                 onValueChange={setFontSize}
                                 min={12}
                                 max={72}
                                 step={2}
                              />
                           </div>

                           <div>
                              <div className="mb-2 flex items-center justify-between">
                                 <label className="text-sm text-muted-foreground">Opacity</label>
                                 <span className="text-sm font-semibold">{opacity[0]}%</span>
                              </div>
                              <Slider
                                 value={opacity}
                                 onValueChange={setOpacity}
                                 min={10}
                                 max={100}
                                 step={5}
                              />
                           </div>

                           <div>
                              <label className="mb-2 block text-sm text-muted-foreground">Color</label>
                              <div className="flex gap-2">
                                 <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="h-10 w-16 cursor-pointer rounded-lg border border-border"
                                 />
                                 <Input
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    className="flex-1"
                                 />
                              </div>
                           </div>
                        </div>

                        {/* Position */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <h4 className="mb-3 text-sm font-medium">Position</h4>
                           <div className="grid grid-cols-3 gap-2">
                              {positions.map((pos) => (
                                 <button
                                    key={pos.value}
                                    onClick={() => setPosition(pos.value)}
                                    className={cn(
                                       "rounded-lg px-3 py-2 text-xs font-medium transition-all",
                                       position === pos.value
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-card hover:bg-muted"
                                    )}
                                 >
                                    {pos.name}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Font Selection */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <h4 className="mb-3 text-sm font-medium">Font</h4>
                           <div className="flex flex-wrap gap-2">
                              {fonts.map((f) => (
                                 <button
                                    key={f.value}
                                    onClick={() => setFont(f.value)}
                                    className={cn(
                                       "rounded-lg px-4 py-2 text-sm transition-all",
                                       font === f.value
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-card hover:bg-muted"
                                    )}
                                    style={{ fontFamily: f.value }}
                                 >
                                    {f.name}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                           <Button
                              variant="gradient"
                              className="flex-1"
                              onClick={addWatermark}
                              disabled={isProcessing || !text}
                           >
                              {isProcessing ? (
                                 <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                 </>
                              ) : (
                                 "Add Watermark"
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
                              src={watermarkedUrl || preview}
                              alt="Preview"
                              className="h-auto w-full object-contain"
                              style={{ maxHeight: "400px" }}
                           />
                           {watermarkedUrl && (
                              <div className="absolute right-3 top-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                 Watermarked
                              </div>
                           )}
                        </div>

                        {watermarkedUrl && (
                           <Button
                              variant="gradient"
                              className="mt-4 w-full"
                              onClick={downloadImage}
                           >
                              <Download className="mr-2 h-4 w-4" />
                              Download Watermarked Image
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
                  <p>Add a professional text or logo watermark to your images instantly with this free online watermarking tool. Whether you're a photographer, content creator, business owner, or designer, this tool helps protect your images from unauthorized use. No software, no login, and no editing skills needed—just upload, customize, and download in seconds.</p>
               </div>
            </div>
         </div>
         <div className="why-use padding">
            <div className="container">
               <h2 className="text-center">Why Use This Add Watermark Tool?</h2>
               <div className="wrap">
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt=""
                        />
                     </div>
                     <p className="text text-center">Prevent unauthorized use or image theft</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon2}
                           alt=""
                        />
                     </div>
                     <p className="text text-center">Easily add text or logo watermarks</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt=""
                        />
                     </div>
                     <p className="text text-center">Adjust watermark size, opacity, and position</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt=""
                        />
                     </div>
                     <p className="text text-center">Maintain high-quality image output</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt=""
                        />
                     </div>
                     <p className="text text-center">Works on all devices mobile, tablet, desktop</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt=""
                        />
                     </div>
                     <p className="text text-center">100% free and no watermark from the tool</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="advantages padding">
            <div className="container">
               <h2 className="text-center">Advantages of This Tool</h2>
               <div className="content">
                  <p>This watermark tool offers a fast, secure, and efficient way to brand and protect your images without expensive software. It provides full customization options like opacity control, font styling, logo placement, and scaling—ensuring your watermark looks professional on every image. Because everything processes in your browser, your files remain private and secure. Whether you need watermarks for social media, client photos, product images, or digital artwork, this tool delivers reliable results with minimal effort.</p>
               </div>
            </div>
         </div>
         <div className="features-sec padding">
            <div className="container">
               <h2 className="text-center">Comparison With Other Image Resizing Tools</h2>
               <div className="main-wrap">
                  <div className="wrap">
                     <div className="features">
                        <h3>Features</h3>
                        <ul>
                           <li>Add text & logo watermark</li>
                           <li>Fully free, no hidden watermark</li>
                           <li>No login required</li>
                           <li>Browser-based, fast</li>
                           <li>Full customization options</li>
                           <li>Works on all devices</li>
                           <li>Easy to use</li>
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
                           <li>✘ Adds own watermark</li>
                           <li>✘ Requires account</li>
                           <li>✘ Slow / ads</li>
                           <li>✘ Very limited</li>
                           <li>✘ Mobile issues</li>
                           <li>✘ Complicated UI</li>
                        </ul>
                     </div>
                     <div className="other-tools">
                        <h3>Offline Editors</h3>
                        <ul>
                           <li>✔</li>
                           <li>✘ Paid</li>
                           <li>✘</li>
                           <li>✔</li>
                           <li>✔ Advanced</li>
                           <li>✘ Desktop only</li>
                           <li>✘ Requires skill</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="use-case padding">
            <div className="container">
               <h2 className="text-center">How to Use the Add Watermark Tool</h2>
               <div className="content">
                  <ul>
                     <li>1. Upload Your Image</li>
                     <li>2. Choose Text or Logo Watermark</li>
                     <li>3. Customize the Watermark</li>
                     <li>4. Preview the Result</li>
                     <li>5. Download Your Watermarked Image</li>
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
                           <p className="question">1. Does this tool add its own watermark?</p>
                           <p className="answer">No, the tool never adds any watermark or branding. Only your selected watermark will appear.</p>
                        </div>
                        <div className="single">
                           <p className="question">2. Can I upload my own logo as a watermark?</p>
                           <p className="answer">Yes, you can upload PNG logos with transparency for best results.</p>
                        </div>
                        <div className="single">
                           <p className="question">3. Will watermarking reduce image quality?</p>
                           <p className="answer">No, the output image maintains the same quality as the original.</p>
                        </div>
                        <div className="single">
                           <p className="question">4. Is this tool free to use?</p>
                           <p className="answer">Yes, it is completely free with no restrictions or premium requirements.</p>
                        </div>
                        <div className="single">
                           <p className="question">5. Are my images stored on the server?</p>
                           <p className="answer">No, all processing happens locally in your browser for maximum privacy.</p>
                        </div>
                        <div className="single">
                           <p className="question">6. Can I create multiple watermarked versions?</p>
                           <p className="answer">Yes, you can edit and download as many versions as you want.</p>
                        </div>
                        <div className="single">
                           <p className="question">7. Does it work on mobile devices?</p>
                           <p className="answer">Yes, this watermark tool works smoothly on all iOS, Android, and tablet devices.</p>
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
