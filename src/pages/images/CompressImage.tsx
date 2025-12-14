import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/Reduce-image-size-up-to-90.svg"
import Icon2 from "@/assets/images/Improve-website-loading-speed-and-SEO-score.svg"
import Icon3 from "@/assets/images/Maintain-high-clarity-with-smart-compression.svg"
import Icon4 from "@/assets/images/Works-with-JPG,-PNG-and-WebP.svg"
import Icon5 from "@/assets/images/No-watermark,-no-signup-no-limitations.svg"
import Icon6 from "@/assets/images/Useful-for-blogs-ecommerce-portfolios-and-designers.svg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-compress-image.png"
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
   Settings2,
} from "lucide-react";
import { ToolCard } from "@/components/shared/ToolCard";

const imageTools = [
   // {
   //    title: "Compress Image",
   //    description: "Reduce file size while maintaining quality",
   //    icon: Minimize2,
   //    href: "/image-compress",
   //    gradient: "from-emerald-500 to-teal-500",
   // },
   {
      title: "Change Background",
      description: "AI Background Remover",
      icon: Palette,
      href: "/change-background",
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
export default function CompressImage() {
   const [file, setFile] = useState<File | null>(null);
   const [quality, setQuality] = useState([80]);
   const [preview, setPreview] = useState<string | null>(null);
   const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
   const [compressedSize, setCompressedSize] = useState<number | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);

   const handleFilesSelected = useCallback((files: File[]) => {
      if (files.length > 0) {
         const selectedFile = files[0];
         setFile(selectedFile);
         setPreview(URL.createObjectURL(selectedFile));
         setCompressedUrl(null);
         setCompressedSize(null);
      }
   }, []);

   const compressImage = useCallback(async () => {
      if (!file) return;

      setIsProcessing(true);
      try {
         const canvas = document.createElement("canvas");
         const ctx = canvas.getContext("2d");
         const img = new Image();

         img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob(
               (blob) => {
                  if (blob) {
                     const url = URL.createObjectURL(blob);
                     setCompressedUrl(url);
                     setCompressedSize(blob.size);
                     setIsProcessing(false);
                     toast.success("Image compressed successfully!");
                  }
               },
               "image/jpeg",
               quality[0] / 100
            );
         };

         img.src = URL.createObjectURL(file);
      } catch (error) {
         setIsProcessing(false);
         toast.error("Failed to compress image");
      }
   }, [file, quality]);

   const downloadImage = useCallback(() => {
      if (!compressedUrl || !file) return;

      const link = document.createElement("a");
      link.href = compressedUrl;
      link.download = `compressed_${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
   }, [compressedUrl, file]);

   const reset = () => {
      setFile(null);
      setPreview(null);
      setCompressedUrl(null);
      setCompressedSize(null);
      setQuality([80]);
   };

   const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
   };

   const reduction = file && compressedSize
      ? Math.round((1 - compressedSize / file.size) * 100)
      : 0;

   // const canonicalUrl = window.location.origin + "/image-compress";
   const canonicalUrl = "https://compressimagepro.com" + "/image-compress";

   const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
         {
            "@type": "Question",
            "name": "Does compressing an image reduce quality?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Our smart algorithm keeps the image clear while significantly reducing size."
            }
         },
         {
            "@type": "Question",
            "name": "Which formats are supported?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "You can compress JPG, JPEG, PNG, and WebP files."
            }
         },
         {
            "@type": "Question",
            "name": "Is the tool free to use?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, it’s completely free with unlimited usage."
            }
         },
         {
            "@type": "Question",
            "name": "Are my files stored on the server?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "No, image processing happens in real-time and nothing is stored."
            }
         },
         {
            "@type": "Question",
            "name": "Can I compress multiple images at once?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, bulk compression is supported."
            }
         },
         {
            "@type": "Question",
            "name": "How much file size can be reduced?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Most images can be reduced by 70–90% depending on resolution."
            }
         },
         {
            "@type": "Question",
            "name": "Does compressing images improve SEO?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, smaller images speed up your website, improving SEO rankings."
            }
         }
      ]
   };
   return (
      <div className="">
         <Helmet>
            <title>Free Image Compressor Online | Reduce Image Size Without Quality Loss</title>
            <meta
               name="description"
               content="Compress your images online for free. No login required. Reduce PNG, JPG, and WebP file size without losing quality."
            />
            <link rel="canonical" href={canonicalUrl} />
            {/* OG Tags */}
            <meta property="og:title" content="Free Image Compressor Online" />
            <meta
               property="og:description"
               content="Compress images instantly. 100% free & no signup."
            />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={OGImage} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Free Image Compressor Online" />
            <meta name="twitter:description" content="Compress images instantly. 100% free & no signup." />
            <meta name="twitter:image" content={OGImage} />

            <script type="application/ld+json">
               {JSON.stringify(faqSchema)}
            </script>
         </Helmet>
         <ToolLayout
            title="Online image compressor"
            description=""
            icon={Minimize2}
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
                        {/* Quality Settings */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <div className="mb-4 flex items-center gap-2">
                              <Settings2 className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">Compression Settings</span>
                           </div>

                           <div className="space-y-4">
                              <div>
                                 <div className="mb-2 flex items-center justify-between">
                                    <label className="text-sm text-muted-foreground">Quality</label>
                                    <span className="text-sm font-semibold text-foreground">{quality[0]}%</span>
                                 </div>
                                 <Slider
                                    value={quality}
                                    onValueChange={setQuality}
                                    min={10}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                 />
                                 <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                    <span>Smaller file</span>
                                    <span>Better quality</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* File Info */}
                        <div className="rounded-xl border border-border bg-muted/30 p-4">
                           <h4 className="mb-3 text-sm font-medium">File Information</h4>
                           <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                 <span className="text-muted-foreground">Original size:</span>
                                 <span className="font-medium">{formatSize(file.size)}</span>
                              </div>
                              {compressedSize && (
                                 <>
                                    <div className="flex justify-between">
                                       <span className="text-muted-foreground">Compressed size:</span>
                                       <span className="font-medium text-primary">{formatSize(compressedSize)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                       <span className="text-muted-foreground">Reduction:</span>
                                       <span className="font-semibold text-emerald-600">-{reduction}%</span>
                                    </div>
                                 </>
                              )}
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                           <Button
                              variant="gradient"
                              className="flex-1"
                              onClick={compressImage}
                              disabled={isProcessing}
                           >
                              {isProcessing ? (
                                 <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                 </>
                              ) : (
                                 "Compress Image"
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
                              src={compressedUrl || preview}
                              alt="Preview"
                              className="h-auto w-full object-contain"
                              style={{ maxHeight: "400px" }}
                           />
                           {compressedUrl && (
                              <div className="absolute right-3 top-3 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg">
                                 Compressed -{reduction}%
                              </div>
                           )}
                        </div>

                        {compressedUrl && (
                           <Button
                              variant="gradient"
                              className="mt-4 w-full"
                              onClick={downloadImage}
                           >
                              <Download className="mr-2 h-4 w-4" />
                              Download Compressed Image
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
                  <p>Compress your images online without losing quality. This free Image Compressor reduces file size up to 90% while maintaining clarity, making your photos lighter, faster, and optimized for websites, apps, and social media. No login required simply upload, compress, and download instantly.</p>
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
                           alt="Reduce image size up to 90%"
                        />
                     </div>
                     <p className="text text-center">Reduce image size up to 90%</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon2}
                           alt="Improve website loading speed and SEO score"
                        />
                     </div>
                     <p className="text text-center">Improve website loading speed and SEO score</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon3}
                           alt="Maintain high clarity with smart compression"
                        />
                     </div>
                     <p className="text text-center">Maintain high clarity with smart compression</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon4}
                           alt="Works with JPG, PNG, and WebP"
                        />
                     </div>
                     <p className="text text-center">Works with JPG, PNG, and WebP</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon5}
                           alt="No watermark, no signup, no limitations"
                        />
                     </div>
                     <p className="text text-center">No watermark, no signup, no limitations</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon6}
                           alt="Useful for blogs, ecommerce, portfolios, and designers"
                        />
                     </div>
                     <p className="text text-center">Useful for blogs, ecommerce, portfolios, and designers</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="advantages padding">
            <div className="container">
               <h2 className="text-center">Advantages of Using an Online Image Compressor</h2>
               <div className="content">
                  <p>Using this Image Compressor provides a smooth and efficient way to optimize your photos without sacrificing quality. Compressed images load faster, improving your website’s performance, user experience, and SEO score. You’ll also save storage space, making it easier to manage and organize large collections of photos. Whether you're posting on social media, creating presentations, or updating your online store, optimized images help everything load faster and look sharper. Best of all, this tool is completely free and allows unlimited compression, making it a reliable choice for anyone working with digital media.</p>
               </div>
            </div>
         </div>
         <div className="features-sec padding">
            <div className="container">
               <h2 className="text-center">Why Our Online Image Compressor Outperforms Other Compression Tools</h2>
               {/* <div className="content text-center">
                  <p>Our Image Compressor is built to deliver ultra-fast, high-quality compression without any limits. Unlike traditional compression tools, our platform offers WebP conversion, secure offline processing, auto-resize options, and zero data tracking — making it the ideal solution for designers, developers, marketers, and everyday users.</p>
               </div> */}
               <div className="main-wrap">
                  <div className="wrap">
                     <div className="features">
                        <h3>Features</h3>
                        <ul>
                           <li>Upload Limits</li>
                           <li>Compression Speed</li>
                           <li>Auto Resize Images</li>
                           <li>WebP Conversion</li>
                           <li>Private / Local Compression</li>
                           <li>Works Offline</li>
                           <li>Zero Carbon Emission</li>
                        </ul>
                     </div>
                     <div className="our-tool">
                        <h3>Our Compressor</h3>
                        <ul>
                           <li>No Limits</li>
                           <li>Ultra Fast</li>
                           <li>✔</li>
                           <li>✔</li>
                           <li>✔</li>
                           <li>✔</li>
                           <li>✔</li>
                        </ul>
                     </div>
                     <div className="other-tools">
                        <h3>Other Tools</h3>
                        <ul>
                           <li>20 images / 5MB - 10MB max</li>
                           <li>Slow</li>
                           <li>✘</li>
                           <li>✘</li>
                           <li>✘</li>
                           <li>✘</li>
                           <li>✘</li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className="use-case padding">
            <div className="container">
               <h2 className="text-center">How to Use the Image Compressor Tool</h2>
               <div className="content text-center">
                  <ul>
                     <li>1. Upload Your Image</li>
                     <li>2. Choose Compression Level</li>
                     <li>3. Preview the Output</li>
                     <li>4. Adjust Advanced Options (Optional)</li>
                     <li>5. Download the Compressed Image</li>
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
                     <img src={faqimage} alt="compressimage faq image" />
                  </div>
                  <div className="content">
                     {/* <h2 className="text-center">Frequently Asked Questions</h2> */}
                     <div className="faq-list">
                        <div className="single">
                           <p className="question">1. Does compressing an image reduce quality?</p>
                           <p className="answer">Our smart algorithm keeps the image clear while significantly reducing size.</p>
                        </div>
                        <div className="single">
                           <p className="question">2. Which formats are supported?</p>
                           <p className="answer">You can compress JPG, JPEG, PNG, and WebP files.</p>
                        </div>
                        <div className="single">
                           <p className="question">3. Is the tool free to use?</p>
                           <p className="answer">Yes, it’s completely free with unlimited usage.</p>
                        </div>
                        <div className="single">
                           <p className="question">4. Are my files stored on the server?</p>
                           <p className="answer">No, image processing happens in real-time and nothing is stored.</p>
                        </div>
                        <div className="single">
                           <p className="question">5. Can I compress multiple images at once?</p>
                           <p className="answer">Yes, bulk compression is supported.</p>
                        </div>
                        <div className="single">
                           <p className="question">6. How much file size can be reduced?</p>
                           <p className="answer">Most images can be reduced by 70–90% depending on resolution.</p>
                        </div>
                        <div className="single">
                           <p className="question">7. Does compressing images improve SEO?</p>
                           <p className="answer">Yes, smaller images speed up your website, improving SEO rankings.</p>
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
