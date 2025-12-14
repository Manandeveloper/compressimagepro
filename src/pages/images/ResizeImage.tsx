import { useState, useCallback, useEffect } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/Reduce-image-size-up-to-90.svg"
import Icon2 from "@/assets/images/Crop-images-to-any-custom-dimensions.svg"
import Icon3 from "@/assets/images/Reduce-file-size-for-faster-website-performance.svg"
import Icon4 from "@/assets/images/Works-with-JPG,-PNG-and-WebP.svg"
import Icon5 from "@/assets/images/No-installation-or-signup-required.svg"
import Icon6 from "@/assets/images/completely-browser-based-and-free-to-use.svg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-resize-image.png"
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
   Link2,
   Link2Off,
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
   // {
   //    title: "Resize Image",
   //    description: "Change dimensions with precision",
   //    icon: Scaling,
   //    href: "/image-resize",
   //    gradient: "from-blue-500 to-cyan-500",
   // },
   {
      title: "Change Background",
      description: "AI Background Remover",
      icon: Palette,
      href: "/change-background",
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
const presets = [
   { name: "Instagram Post", width: 1080, height: 1080 },
   { name: "Instagram Story", width: 1080, height: 1920 },
   { name: "Facebook Cover", width: 851, height: 315 },
   { name: "Twitter Header", width: 1500, height: 500 },
   { name: "YouTube Thumbnail", width: 1280, height: 720 },
   { name: "LinkedIn Banner", width: 1584, height: 396 },
];

export default function ResizeImage() {
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string | null>(null);
   const [resizedUrl, setResizedUrl] = useState<string | null>(null);
   const [originalWidth, setOriginalWidth] = useState(0);
   const [originalHeight, setOriginalHeight] = useState(0);
   const [width, setWidth] = useState(0);
   const [height, setHeight] = useState(0);
   const [maintainRatio, setMaintainRatio] = useState(true);
   const [isProcessing, setIsProcessing] = useState(false);

   const aspectRatio = originalWidth / originalHeight;

   const handleFilesSelected = useCallback((files: File[]) => {
      if (files.length > 0) {
         const selectedFile = files[0];
         setFile(selectedFile);
         setResizedUrl(null);

         const img = new Image();
         img.onload = () => {
            setOriginalWidth(img.width);
            setOriginalHeight(img.height);
            setWidth(img.width);
            setHeight(img.height);
            setPreview(URL.createObjectURL(selectedFile));
         };
         img.src = URL.createObjectURL(selectedFile);
      }
   }, []);

   const handleWidthChange = (newWidth: number) => {
      setWidth(newWidth);
      if (maintainRatio && aspectRatio) {
         setHeight(Math.round(newWidth / aspectRatio));
      }
   };

   const handleHeightChange = (newHeight: number) => {
      setHeight(newHeight);
      if (maintainRatio && aspectRatio) {
         setWidth(Math.round(newHeight * aspectRatio));
      }
   };

   const applyPreset = (preset: typeof presets[0]) => {
      setWidth(preset.width);
      setHeight(preset.height);
      setMaintainRatio(false);
   };

   const resizeImage = useCallback(async () => {
      if (!file) return;

      setIsProcessing(true);
      try {
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");
         const img = new Image();

         img.onload = () => {
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
               (blob) => {
                  if (blob) {
                     const url = URL.createObjectURL(blob);
                     setResizedUrl(url);
                     setIsProcessing(false);
                     toast.success("Image resized successfully!");
                  }
               },
               file.type || "image/png",
               0.95
            );
         };

         img.src = URL.createObjectURL(file);
      } catch (error) {
         setIsProcessing(false);
         toast.error("Failed to resize image");
      }
   }, [file, width, height]);

   const downloadImage = useCallback(() => {
      if (!resizedUrl || !file) return;

      const link = document.createElement("a");
      link.href = resizedUrl;
      const ext = file.name.split(".").pop();
      link.download = `resized_${width}x${height}_${file.name.replace(/\.[^/.]+$/, "")}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
   }, [resizedUrl, file, width, height]);

   const reset = () => {
      setFile(null);
      setPreview(null);
      setResizedUrl(null);
      setWidth(0);
      setHeight(0);
   };
   // const canonicalUrl = window.location.origin + "/image-resize";
   const canonicalUrl = "https://compressimagepro.com" + "/image-resize";
   const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
         {
            "@type": "Question",
            "name": "Does resizing reduce the image quality?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Not necessarily. Our tool uses smart compression to ensure the resized image stays as sharp and clear as possible."
            }
         },
         {
            "@type": "Question",
            "name": "Can I resize images without maintaining the aspect ratio?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, you can manually enter custom dimensions to stretch or fit the image as you prefer."
            }
         },
         {
            "@type": "Question",
            "name": "What image formats are supported?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "You can upload JPG, PNG, JPEG, WEBP, and GIF files."
            }
         },
         {
            "@type": "Question",
            "name": "Is the tool free to use?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, it is completely free—no subscriptions, no account, no watermark."
            }
         },
         {
            "@type": "Question",
            "name": "Are my images stored online?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "No. Everything runs in your browser, ensuring complete privacy and security."
            }
         },
         {
            "@type": "Question",
            "name": "Can I resize images for social media?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Absolutely. You can set exact dimensions for platforms like Instagram, Facebook, YouTube, Pinterest, and more."
            }
         },
         {
            "@type": "Question",
            "name": "Can I resize multiple images at once?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Bulk resize is coming soon. Right now, you can resize one image at a time."
            }
         }
      ]
   };
   return (
      <div className="">
         <Helmet>
            <title>Resize Image Online Free | JPG, PNG, WebP Resizer</title>
            <meta
               name="description"
               content="Resize images online for free. Maintain quality while changing width and height. Supports JPG, PNG, JPEG, and WebP formats."
            />
            <link rel="canonical" href={canonicalUrl} />

            <meta property="og:title" content="Resize Image Online Free" />
            <meta
               property="og:description"
               content="Resize any image instantly. No login required. High-quality results."
            />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:image" content={OGImage} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Resize Image Online Free" />
            <meta name="twitter:description" content="Resize any image instantly. No login required. High-quality results." />
            <meta name="twitter:image" content={OGImage} />
            <script type="application/ld+json">
               {JSON.stringify(faqSchema)}
            </script>
         </Helmet>

         <ToolLayout
            title="Resize image online – adjust width & height instantly for free"
            description=""
            icon={Scaling}
         >
            <div className="grid gap-8 lg:grid-cols-2">
               {/* Left: Upload & Settings */}
               <div className="space-y-6">
                  <FileUpload
                     accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"] }}
                     onFilesSelected={handleFilesSelected}
                     fileType="image"
                     label="Drop your image here"
                     description="PNG, JPG, JPEG, WebP or GIF"
                  />

                  {file && (
                     <div className="space-y-6 animate-slide-up">
                        {/* Dimension Controls */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <div className="mb-4 flex items-center justify-between">
                              <span className="text-sm font-medium">Dimensions</span>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => setMaintainRatio(!maintainRatio)}
                                 className={maintainRatio ? "text-primary" : "text-muted-foreground"}
                              >
                                 {maintainRatio ? (
                                    <Link2 className="mr-2 h-4 w-4" />
                                 ) : (
                                    <Link2Off className="mr-2 h-4 w-4" />
                                 )}
                                 {maintainRatio ? "Linked" : "Unlinked"}
                              </Button>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="mb-1.5 block text-xs text-muted-foreground">Width (px)</label>
                                 <Input
                                    type="number"
                                    value={width}
                                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                                    min={1}
                                    max={10000}
                                 />
                              </div>
                              <div>
                                 <label className="mb-1.5 block text-xs text-muted-foreground">Height (px)</label>
                                 <Input
                                    type="number"
                                    value={height}
                                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                                    min={1}
                                    max={10000}
                                 />
                              </div>
                           </div>

                           <p className="mt-3 text-xs text-muted-foreground">
                              Original: {originalWidth} × {originalHeight} px
                           </p>
                        </div>

                        {/* Presets */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <h4 className="mb-3 text-sm font-medium">Quick Presets</h4>
                           <div className="grid grid-cols-2 gap-2">
                              {presets.map((preset) => (
                                 <Button
                                    key={preset.name}
                                    variant="outline"
                                    size="sm"
                                    className="justify-start text-xs"
                                    onClick={() => applyPreset(preset)}
                                 >
                                    {preset.name}
                                 </Button>
                              ))}
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                           <Button
                              variant="gradient"
                              className="flex-1"
                              onClick={resizeImage}
                              disabled={isProcessing || !width || !height}
                           >
                              {isProcessing ? (
                                 <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                 </>
                              ) : (
                                 "Resize Image"
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
                              src={resizedUrl || preview}
                              alt="Preview"
                              className="h-auto w-full object-contain"
                              style={{ maxHeight: "400px" }}
                           />
                           {resizedUrl && (
                              <div className="absolute right-3 top-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                 {width} × {height}
                              </div>
                           )}
                        </div>

                        {resizedUrl && (
                           <Button
                              variant="gradient"
                              className="mt-4 w-full"
                              onClick={downloadImage}
                           >
                              <Download className="mr-2 h-4 w-4" />
                              Download Resized Image
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
                  <p>Resize your images instantly with our free Online Image Resizer. Adjust dimensions, change aspect ratio, and optimize visuals for web, social media, or print—without losing quality. Whether you’re a designer, photographer, or everyday user, this tool makes image resizing fast, easy, and accessible for everyone.</p>
               </div>
            </div>
         </div>
         <div className="why-use padding">
            <div className="container">
               <h2 className="text-center">Why Use CompressImagepro to compress images?</h2>
               <div className="wrap">
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt="Resize images without noticeable quality loss"
                        />
                     </div>
                     <p className="text text-center">Resize images without noticeable quality loss</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon2}
                           alt="Maintain aspect ratio or set custom dimensions"
                        />
                     </div>
                     <p className="text text-center">Maintain aspect ratio or set custom dimensions</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon3}
                           alt="Reduce file size for faster website performance"
                        />
                     </div>
                     <p className="text text-center">Reduce file size for faster website performance</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon4}
                           alt="Works with PNG, JPG, JPEG, WEBP, GIF"
                        />
                     </div>
                     <p className="text text-center">Works with PNG, JPG, JPEG, WEBP, GIF</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon5}
                           alt="No account or premium subscription required"
                        />
                     </div>
                     <p className="text text-center">No account or premium subscription required</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon6}
                           alt="100% free and secure—your files never leave your device"
                        />
                     </div>
                     <p className="text text-center">100% free and secure—your files never leave your device</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="advantages padding">
            <div className="container">
               <h2 className="text-center">Advantages of Using This Image Resize Tool</h2>
               <div className="content">
                  <p>Our Image Resizer offers an effortless way to adjust image dimensions while protecting clarity and sharpness. Unlike traditional editors that blur or distort resized images, this tool uses smart scaling techniques to preserve important details. It supports all popular formats and works directly in your browser, ensuring quick performance without requiring software installation. The tool is especially useful for web optimization, allowing users to get perfectly sized images that load faster without compromising appearance.</p>
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
                           <li>Free to use</li>
                           <li>No login required</li>
                           <li>Quality maintained after resizing</li>
                           <li>Bulk resizing</li>
                           <li>Runs in browser</li>
                           <li>Supports PNG/JPG/WEBP/GIF</li>
                           <li>Zero file upload to server</li>
                        </ul>
                     </div>
                     <div className="our-tool">
                        <h3>Our Tool</h3>
                        <ul>
                           <li>✔ Yes</li>
                           <li>✔ Yes</li>
                           <li>✔ High</li>
                           <li>✘ Coming soon</li>
                           <li>✔ Yes</li>
                           <li>✔ Yes</li>
                           <li>✔ Yes</li>
                        </ul>
                     </div>
                     <div className="other-tools">
                        <h3>Photoshop</h3>
                        <ul>
                           <li>✘ No</li>
                           <li>✘ No</li>
                           <li>✔ High</li>
                           <li>✔ Yes</li>
                           <li>✘ No</li>
                           <li>✔ Yes</li>
                           <li>✘ No</li>
                        </ul>
                     </div>
                     <div className="other-tools">
                        <h3>Canva</h3>
                        <ul>
                           <li>✘ Partially</li>
                           <li>✘ No</li>
                           <li>⚠️ Medium</li>
                           <li>✘ No</li>
                           <li>✔ Yes</li>
                           <li>✘ Limited</li>
                           <li>✘ No</li>
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
                     <img src={faqimage} alt="resize faq image" />
                  </div>
                  <div className="content">
                     {/* <h2 className="text-center">Frequently Asked Questions</h2> */}
                     <div className="faq-list">
                        <div className="single">
                           <p className="question">1. Does resizing reduce the image quality?</p>
                           <p className="answer">Not necessarily. Our tool uses smart compression to ensure the resized image stays as sharp and clear as possible.</p>
                        </div>
                        <div className="single">
                           <p className="question">2. Can I resize images without maintaining the aspect ratio?</p>
                           <p className="answer">Yes, you can manually enter custom dimensions to stretch or fit the image as you prefer.</p>
                        </div>
                        <div className="single">
                           <p className="question">3. What image formats are supported?</p>
                           <p className="answer">You can upload JPG, PNG, JPEG, WEBP, and GIF files.</p>
                        </div>
                        <div className="single">
                           <p className="question">4. Is the tool free to use?</p>
                           <p className="answer">Yes, it is completely free no subscriptions, no account, no watermark.</p>
                        </div>
                        <div className="single">
                           <p className="question">5. Are my images stored online?</p>
                           <p className="answer">No. Everything runs in your browser, ensuring complete privacy and security.</p>
                        </div>
                        <div className="single">
                           <p className="question">6. Can I resize images for social media?</p>
                           <p className="answer">Absolutely. You can set exact dimensions for platforms like Instagram, Facebook, YouTube, Pinterest, and more.</p>
                        </div>
                        <div className="single">
                           <p className="question">7. Can I resize multiple images at once?</p>
                           <p className="answer">Bulk resize is coming soon. Right now, you can resize one image at a time.</p>
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
