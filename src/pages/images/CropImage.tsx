import { useState, useCallback, useRef } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/Crop-images-to-any-custom-dimensions.svg"
import Icon2 from "@/assets/images/Remove-unwanted-background.svg"
import Icon3 from "@/assets/images/Works-with-JPG,-PNG-and-WebP.svg"
import Icon4 from "@/assets/images/Real-time-preview-to-ensure-perfect-framing.svg"
import Icon5 from "@/assets/images/No-quality-loss-during-the-cropping-process.svg"
import Icon6 from "@/assets/images/completely-browser-based-and-free-to-use.svg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-crop-image.png"
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
   Check
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
   // {
   //    title: "Crop Image",
   //    description: "Crop to perfect dimensions",
   //    icon: Crop,
   //    href: "/image-crop",
   //    gradient: "from-violet-500 to-purple-500",
   // },
   {
      title: "Change Background",
      description: "AI Background Remover",
      icon: Palette,
      href: "/change-background",
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
const aspectRatios = [
   { name: "Free", value: null },
   { name: "1:1", value: 1 },
   { name: "4:3", value: 4 / 3 },
   { name: "16:9", value: 16 / 9 },
   { name: "9:16", value: 9 / 16 },
   { name: "3:2", value: 3 / 2 },
];

export default function CropImage() {
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string | null>(null);
   const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
   const [selectedRatio, setSelectedRatio] = useState<number | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);
   const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
   const [isDragging, setIsDragging] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   const handleFilesSelected = useCallback((files: File[]) => {
      if (files.length > 0) {
         const selectedFile = files[0];
         setFile(selectedFile);
         setCroppedUrl(null);

         const img = new Image();
         img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
            setCropArea({ x: 0, y: 0, width: 100, height: 100 });
            setPreview(URL.createObjectURL(selectedFile));
         };
         img.src = URL.createObjectURL(selectedFile);
      }
   }, []);

   const handleRatioChange = (ratio: number | null) => {
      setSelectedRatio(ratio);
      if (ratio) {
         const newHeight = 100 / ratio;
         setCropArea((prev) => ({
            ...prev,
            width: 100,
            height: Math.min(100, newHeight),
         }));
      }
   };

   const cropImage = useCallback(async () => {
      if (!file || !preview) return;

      setIsProcessing(true);
      try {
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");
         const img = new Image();

         img.onload = () => {
            const cropX = (cropArea.x / 100) * img.width;
            const cropY = (cropArea.y / 100) * img.height;
            const cropWidth = (cropArea.width / 100) * img.width;
            const cropHeight = (cropArea.height / 100) * img.height;

            canvas.width = cropWidth;
            canvas.height = cropHeight;
            ctx?.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            canvas.toBlob(
               (blob) => {
                  if (blob) {
                     const url = URL.createObjectURL(blob);
                     setCroppedUrl(url);
                     setIsProcessing(false);
                     toast.success("Image cropped successfully!");
                  }
               },
               file.type || "image/png",
               0.95
            );
         };

         img.src = preview;
      } catch (error) {
         setIsProcessing(false);
         toast.error("Failed to crop image");
      }
   }, [file, preview, cropArea]);

   const downloadImage = useCallback(() => {
      if (!croppedUrl || !file) return;

      const link = document.createElement("a");
      link.href = croppedUrl;
      const ext = file.name.split(".").pop();
      link.download = `cropped_${file.name.replace(/\.[^/.]+$/, "")}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
   }, [croppedUrl, file]);

   const reset = () => {
      setFile(null);
      setPreview(null);
      setCroppedUrl(null);
      setCropArea({ x: 0, y: 0, width: 100, height: 100 });
   };
   // const canonicalUrl = window.location.origin + "/image-crop";
   const canonicalUrl = "https://compressimagepro.netlify.app" + "/image-crop";
   const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
         {
            "@type": "Question",
            "name": "Can I crop images without losing quality?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, this tool preserves the original resolution and sharpness as much as possible during cropping."
            }
         },
         {
            "@type": "Question",
            "name": "What image formats are supported?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "You can upload JPG, JPEG, PNG, and WebP images without any issues."
            }
         },
         {
            "@type": "Question",
            "name": "Can I crop images to a specific size?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Absolutely! You can manually adjust dimensions or select preset aspect ratios to get the perfect crop."
            }
         },
         {
            "@type": "Question",
            "name": "Does this tool work on mobile devices?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, it is fully responsive and works smoothly on mobile, tablet, and desktop browsers."
            }
         },
         {
            "@type": "Question",
            "name": "Is the tool free to use?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, the image crop tool is completely free with no hidden limitations."
            }
         },
         {
            "@type": "Question",
            "name": "Do I need to install any software?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "No installation is required; everything works directly in your browser without needing software downloads."
            }
         },
         {
            "@type": "Question",
            "name": "Can I crop images for social media?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, you can crop images for Instagram, Facebook, YouTube thumbnails, and other platforms using preset or custom aspect ratios."
            }
         }
      ]
   };
   return (
      <div className="">
         <Helmet>
            <title>Crop Image Online Free | JPG, PNG, WebP Image Cropper</title>
            <meta
               name="description"
               content="Crop any image online for free. Select area and crop JPG, PNG, WebP with precision. No login required."
            />
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:title" content="Crop Image Online Free" />
            <meta
               property="og:description"
               content="Crop JPG, PNG, and WebP images instantly using an easy-to-use cropper."
            />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={OGImage} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Crop Image Online Free" />
            <meta name="twitter:description" content="Crop JPG, PNG, and WebP images instantly using an easy-to-use cropper." />
            <meta name="twitter:image" content={OGImage} />
            <script type="application/ld+json">
               {JSON.stringify(faqSchema)}
            </script>
         </Helmet>

         <ToolLayout
            title="Crop image online – cut, trim & remove unwanted portions free"
            description=""
            icon={Crop}
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
                        {/* Aspect Ratio Selection */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <h4 className="mb-4 text-sm font-medium">Aspect Ratio</h4>
                           <div className="flex flex-wrap gap-2">
                              {aspectRatios.map((ratio) => (
                                 <button
                                    key={ratio.name}
                                    onClick={() => handleRatioChange(ratio.value)}
                                    className={cn(
                                       "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                                       selectedRatio === ratio.value
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-card hover:bg-muted"
                                    )}
                                 >
                                    {ratio.name}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Info */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <h4 className="mb-2 text-sm font-medium">Original Size</h4>
                           <p className="text-sm text-muted-foreground">
                              {imageSize.width} × {imageSize.height} pixels
                           </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                           <Button
                              variant="gradient"
                              className="flex-1"
                              onClick={cropImage}
                              disabled={isProcessing}
                           >
                              {isProcessing ? (
                                 <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                 </>
                              ) : (
                                 "Crop Image"
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
                        <h4 className="mb-3 text-sm font-medium">
                           {croppedUrl ? "Cropped Result" : "Preview"}
                        </h4>
                        <div
                           ref={containerRef}
                           className="relative overflow-hidden rounded-xl border border-border bg-muted/30"
                        >
                           <img
                              src={croppedUrl || preview}
                              alt="Preview"
                              className="h-auto w-full object-contain"
                              style={{ maxHeight: "400px" }}
                           />
                           {!croppedUrl && (
                              <div
                                 className="absolute border-2 border-primary bg-primary/10"
                                 style={{
                                    left: `${cropArea.x}%`,
                                    top: `${cropArea.y}%`,
                                    width: `${cropArea.width}%`,
                                    height: `${cropArea.height}%`,
                                 }}
                              />
                           )}
                           {croppedUrl && (
                              <div className="absolute right-3 top-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                 Cropped
                              </div>
                           )}
                        </div>

                        {croppedUrl && (
                           <Button
                              variant="gradient"
                              className="mt-4 w-full"
                              onClick={downloadImage}
                           >
                              <Download className="mr-2 h-4 w-4" />
                              Download Cropped Image
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
                  <p>The Online Image Crop Tool allows you to crop any image with precision and ease. Whether you want to remove unwanted areas, change aspect ratios, or fit your image for social media, this tool provides fast, clean, and accurate cropping. No software installation is required—crop, preview, and download your optimized image within seconds.</p>
               </div>
            </div>
         </div>
         <div className="why-use padding">
            <div className="container">
               <h2 className="text-center">Why Use This Image Crop Tool?</h2>
               <div className="wrap">
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt="Crop images to any custom dimensions or aspect ratios"
                        />
                     </div>
                     <p className="text text-center">Crop images to any custom dimensions or aspect ratios</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon2}
                           alt="Remove unwanted background or unnecessary parts instantly"
                        />
                     </div>
                     <p className="text text-center">Remove unwanted background or unnecessary parts instantly</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon3}
                           alt="Supports PNG, JPG, JPEG, and WebP files"
                        />
                     </div>
                     <p className="text text-center">Supports PNG, JPG, JPEG, and WebP files</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon4}
                           alt="Real-time preview to ensure perfect framing"
                        />
                     </div>
                     <p className="text text-center">Real-time preview to ensure perfect framing</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon5}
                           alt="No quality loss during the cropping process"
                        />
                     </div>
                     <p className="text text-center">No quality loss during the cropping process</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon6}
                           alt="Completely browser-based and free to use"
                        />
                     </div>
                     <p className="text text-center">Completely browser-based and free to use</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="advantages padding">
            <div className="container">
               <h2 className="text-center">Advantages of This Tool</h2>
               <div className="content">
                  <p>This image crop tool offers a seamless workflow where accuracy meets convenience. You can manually adjust the cropping area with precise controls, ensuring you capture only the part of the image you want. Unlike many traditional editors, this tool preserves image clarity even after cropping, allowing photographers, designers, and social media users to edit their visuals without worrying about distortion or quality loss. It eliminates the need for heavy software and delivers professional-grade cropping directly in your browser.</p>
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
                           <li>Easy drag-and-drop crop</li>
                           <li>No installation needed</li>
                           <li>Maintains original quality</li>
                           <li>Supports multiple formats</li>
                           <li>Fast & lightweight</li>
                           <li>Free to use</li>
                           <li>Real-time preview</li>
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
                           <li>✔</li>
                           <li>✘ Often reduces quality</li>
                           <li>Limited formats</li>
                           <li>✔ May lag</li>
                           <li>✔ Requires upgrade</li>
                           <li>✘ Not always</li>
                        </ul>
                     </div>
                     <div className="other-tools">
                        <h3>Offline Editors</h3>
                        <ul>
                           <li>✔</li>
                           <li>✘</li>
                           <li>✔</li>
                           <li>✔</li>
                           <li>✘ Heavy software</li>
                           <li>✘ Paid software</li>
                           <li>✔</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="use-case padding">
            <div className="container">
               <h2 className="text-center">How to Use the Image Resizer</h2>
               <div className="content">
                  <ul>
                     <li>1. Upload your image by clicking the “Choose Image” button.</li>
                     <li>2. Enter your desired width and height or select “Maintain Aspect Ratio.”</li>
                     <li>3. Preview the resized version instantly on screen.</li>
                     <li>4. Click “Download Resized Image” to save it.</li>
                     <li>5. Repeat the steps for additional images no limits or login needed.</li>
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
                     <img src={faqimage} alt="cropimage faq image" />
                  </div>
                  <div className="content">
                     {/* <h2 className="text-center">Frequently Asked Questions</h2> */}
                     <div className="faq-list">
                        <div className="single">
                           <p className="question">1. Can I crop images without losing quality?</p>
                           <p className="answer">Yes, this tool preserves the original resolution and sharpness as much as possible during cropping.</p>
                        </div>
                        <div className="single">
                           <p className="question">2. What image formats are supported?</p>
                           <p className="answer">You can upload JPG, JPEG, PNG, and WebP images without any issues.</p>
                        </div>
                        <div className="single">
                           <p className="question">3. Can I crop images to a specific size?</p>
                           <p className="answer">Absolutely! You can manually adjust dimensions or select preset aspect ratios.</p>
                        </div>
                        <div className="single">
                           <p className="question">4. Does this tool work on mobile devices?</p>
                           <p className="answer">Yes, it is fully responsive and works smoothly on mobile, tablet, and desktop browsers.</p>
                        </div>
                        <div className="single">
                           <p className="question">5. Is the tool free to use?</p>
                           <p className="answer">Yes, the image crop tool is completely free with no hidden limitations.</p>
                        </div>
                        <div className="single">
                           <p className="question">6. Do I need to install any software?</p>
                           <p className="answer">No installation is required; everything works directly in your browser.</p>
                        </div>
                        <div className="single">
                           <p className="question">7. Can I crop images for social media?</p>
                           <p className="answer">Yes, you can crop images for Instagram, Facebook, YouTube thumbnails, and other platforms using preset aspect ratios.</p>
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
