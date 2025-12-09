import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import Icon1 from "@/assets/images/AI-powered-accuracy.svg"
import Icon2 from "@/assets/images/Works-on-product-photos-portraits-graphics.svg"
import Icon3 from "@/assets/images/no-photoshope-require.svg"
import Icon4 from "@/assets/images/choose-color.svg"
import Icon5 from "@/assets/images/maintain-high-quality.svg"
import Icon6 from "@/assets/images/No-installation-or-signup-required.svg"
import faqimage from "@/assets/images/faq-image.webp"
import OGImage from "@/assets/images/og-remove-bg-image.png"
import {
   Image,
   Minimize2,
   Type,
   Palette,
   Download,
   RefreshCw,
   Scaling,
   Crop,
   FileOutput,
   Wand2,
   Upload,
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
const solidColors = [
   { name: "White", value: "#FFFFFF" },
   { name: "Black", value: "#000000" },
   { name: "Red", value: "#EF4444" },
   { name: "Blue", value: "#3B82F6" },
   { name: "Green", value: "#22C55E" },
   { name: "Yellow", value: "#EAB308" },
   { name: "Purple", value: "#A855F7" },
   { name: "Pink", value: "#EC4899" },
];

const presets = [
   { id: "gradient-sunset", name: "Sunset", preview: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)" },
   { id: "gradient-ocean", name: "Ocean", preview: "linear-gradient(135deg, #38bdf8, #0891b2)" },
   { id: "gradient-forest", name: "Forest", preview: "linear-gradient(135deg, #86efac, #166534)" },
   { id: "studio-white", name: "Studio White", preview: "linear-gradient(180deg, #ffffff, #f1f5f9)" },
   { id: "studio-gray", name: "Studio Gray", preview: "linear-gradient(180deg, #9ca3af, #4b5563)" },
   { id: "bokeh-lights", name: "Bokeh Lights", preview: "linear-gradient(135deg, #1e1b4b, #312e81, #4c1d95)" },
   { id: "nature-blur", name: "Nature Blur", preview: "linear-gradient(135deg, #bbf7d0, #86efac, #4ade80)" },
   { id: "office-blur", name: "Office Blur", preview: "linear-gradient(135deg, #e2e8f0, #cbd5e1, #94a3b8)" },
];

type BackgroundType = "color" | "preset" | "image";

export default function ChangeBackground() {
   const [file, setFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string | null>(null);
   const [resultUrl, setResultUrl] = useState<string | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);

   const [backgroundType, setBackgroundType] = useState<BackgroundType>("color");
   const [selectedColor, setSelectedColor] = useState("#FFFFFF");
   const [customColor, setCustomColor] = useState("#FFFFFF");
   const [selectedPreset, setSelectedPreset] = useState("gradient-sunset");
   const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
   const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);

   const handleFilesSelected = useCallback((files: File[]) => {
      if (files.length > 0) {
         const selectedFile = files[0];
         setFile(selectedFile);
         setPreview(URL.createObjectURL(selectedFile));
         setResultUrl(null);
      }
   }, []);

   const handleBackgroundImageSelected = useCallback((files: File[]) => {
      if (files.length > 0) {
         const selectedFile = files[0];
         setBackgroundImage(selectedFile);
         setBackgroundImagePreview(URL.createObjectURL(selectedFile));
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

   const changeBackground = useCallback(async () => {
      if (!file) return;

      setIsProcessing(true);
      try {
         const imageBase64 = await fileToBase64(file);
         let backgroundImageBase64: string | undefined;

         if (backgroundType === "image" && backgroundImage) {
            backgroundImageBase64 = await fileToBase64(backgroundImage);
         }

         toast.info("AI is changing your background...", { duration: 5000 });

         const { data, error } = await supabase.functions.invoke("change-background", {
            body: {
               imageBase64,
               backgroundType,
               backgroundColor: backgroundType === "color" ? selectedColor : undefined,
               backgroundPreset: backgroundType === "preset" ? selectedPreset : undefined,
               backgroundImageBase64,
            },
         });

         if (error) {
            throw new Error(error.message || "Failed to process image");
         }

         if (data?.error) {
            throw new Error(data.error);
         }

         if (data?.imageUrl) {
            setResultUrl(data.imageUrl);
            toast.success("Background changed successfully!");
         } else {
            throw new Error("No image returned from AI");
         }
      } catch (error) {
         console.error("Error changing background:", error);
         const message = error instanceof Error ? error.message : "Failed to change background";
         toast.error(message);
      } finally {
         setIsProcessing(false);
      }
   }, [file, backgroundType, selectedColor, selectedPreset, backgroundImage]);

   const downloadImage = useCallback(() => {
      if (!resultUrl || !file) return;
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `new-bg_${file.name.replace(/\.[^/.]+$/, "")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
   }, [resultUrl, file]);

   const reset = () => {
      setFile(null);
      setPreview(null);
      setResultUrl(null);
      setBackgroundImage(null);
      setBackgroundImagePreview(null);
   };
   const canonicalUrl = window.location.origin + "/change-background";
   const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
         {
            "@type": "Question",
            "name": "What types of backgrounds can I apply?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "You can apply solid colors, gradients, templates, or upload any custom background image."
            }
         },
         {
            "@type": "Question",
            "name": "Does the tool work on product photos?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, it works extremely well for product photos, especially for eCommerce listings on Amazon, Flipkart, and Shopify."
            }
         },
         {
            "@type": "Question",
            "name": "Will the image quality remain the same?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, the tool preserves your image resolution even after changing the background."
            }
         },
         {
            "@type": "Question",
            "name": "Is this tool free to use?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, all features are free with no login or subscription required."
            }
         },
         {
            "@type": "Question",
            "name": "Can I use my own custom background?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Absolutely. You can upload any image you want to use as the new background."
            }
         },
         {
            "@type": "Question",
            "name": "Does it work on mobile devices?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, the tool is fully mobile-friendly and works smoothly on all devices."
            }
         },
         {
            "@type": "Question",
            "name": "Is the background removed automatically?",
            "acceptedAnswer": {
               "@type": "Answer",
               "text": "Yes, the AI instantly removes the original background and isolates the subject automatically."
            }
         }
      ]
   };
   return (
      <div className="">
         <Helmet>
            <title>Remove Background from Image Free | AI Background Remover</title>
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
            title="Change image background online – free ai background changer"
            description=""
            icon={Palette}
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
                        {/* Background Type Tabs */}
                        <div className="flex rounded-xl border border-border bg-muted/30 p-1">
                           {(["color", "preset", "image"] as BackgroundType[]).map((type) => (
                              <button
                                 key={type}
                                 onClick={() => setBackgroundType(type)}
                                 className={cn(
                                    "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                                    backgroundType === type
                                       ? "bg-primary text-primary-foreground shadow-sm"
                                       : "text-muted-foreground hover:text-foreground"
                                 )}
                              >
                                 {type === "color" && "Solid Color"}
                                 {type === "preset" && "Presets"}
                                 {type === "image" && "Custom Image"}
                              </button>
                           ))}
                        </div>

                        {/* Color Selection */}
                        {backgroundType === "color" && (
                           <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                              <h4 className="text-sm font-medium">Choose Color</h4>
                              <div className="grid grid-cols-4 gap-2">
                                 {solidColors.map((color) => (
                                    <button
                                       key={color.value}
                                       onClick={() => {
                                          setSelectedColor(color.value);
                                          setCustomColor(color.value);
                                       }}
                                       className={cn(
                                          "relative h-12 rounded-lg border-2 transition-all",
                                          selectedColor === color.value
                                             ? "border-primary ring-2 ring-primary/30"
                                             : "border-border hover:border-primary/50"
                                       )}
                                       style={{ backgroundColor: color.value }}
                                       title={color.name}
                                    >
                                       {selectedColor === color.value && (
                                          <div className="absolute inset-0 flex items-center justify-center">
                                             <Check className={cn("h-5 w-5", color.value === "#FFFFFF" ? "text-foreground" : "text-white")} />
                                          </div>
                                       )}
                                    </button>
                                 ))}
                              </div>
                              <div className="flex gap-2">
                                 <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => {
                                       setCustomColor(e.target.value);
                                       setSelectedColor(e.target.value);
                                    }}
                                    className="h-10 w-14 cursor-pointer rounded-lg border border-border"
                                 />
                                 <Input
                                    value={customColor}
                                    onChange={(e) => {
                                       setCustomColor(e.target.value);
                                       setSelectedColor(e.target.value);
                                    }}
                                    placeholder="#FFFFFF"
                                    className="flex-1"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Preset Selection */}
                        {backgroundType === "preset" && (
                           <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                              <h4 className="text-sm font-medium">Choose Preset</h4>
                              <div className="grid grid-cols-2 gap-3">
                                 {presets.map((preset) => (
                                    <button
                                       key={preset.id}
                                       onClick={() => setSelectedPreset(preset.id)}
                                       className={cn(
                                          "relative h-20 rounded-xl border-2 transition-all overflow-hidden",
                                          selectedPreset === preset.id
                                             ? "border-primary ring-2 ring-primary/30"
                                             : "border-border hover:border-primary/50"
                                       )}
                                       style={{ background: preset.preview }}
                                    >
                                       <div className="absolute inset-0 flex items-end justify-start p-2">
                                          <span className="rounded bg-background/80 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
                                             {preset.name}
                                          </span>
                                       </div>
                                       {selectedPreset === preset.id && (
                                          <div className="absolute right-2 top-2">
                                             <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                             </div>
                                          </div>
                                       )}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Image Upload */}
                        {backgroundType === "image" && (
                           <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                              <h4 className="text-sm font-medium">Upload Background Image</h4>
                              {!backgroundImagePreview ? (
                                 <FileUpload
                                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                    onFilesSelected={handleBackgroundImageSelected}
                                    fileType="image"
                                    label="Drop background image"
                                    description="This will be the new background"
                                 />
                              ) : (
                                 <div className="relative">
                                    <img
                                       src={backgroundImagePreview}
                                       alt="Background"
                                       className="h-32 w-full rounded-lg object-cover"
                                    />
                                    <Button
                                       variant="destructive"
                                       size="sm"
                                       className="absolute right-2 top-2"
                                       onClick={() => {
                                          setBackgroundImage(null);
                                          setBackgroundImagePreview(null);
                                       }}
                                    >
                                       Remove
                                    </Button>
                                 </div>
                              )}
                           </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                           <Button
                              variant="gradient"
                              className="flex-1"
                              onClick={changeBackground}
                              disabled={isProcessing || (backgroundType === "image" && !backgroundImage)}
                           >
                              {isProcessing ? (
                                 <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Changing Background...
                                 </>
                              ) : (
                                 <>
                                    <Palette className="mr-2 h-4 w-4" />
                                    Change Background
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
                              {resultUrl ? "Result" : "Original Image"}
                           </h4>
                           {resultUrl && (
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                                 Background Changed
                              </span>
                           )}
                        </div>

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
                        </div>

                        {resultUrl && (
                           <Button
                              variant="gradient"
                              className="mt-4 w-full"
                              onClick={downloadImage}
                           >
                              <Download className="mr-2 h-4 w-4" />
                              Download Image
                           </Button>
                        )}
                     </div>
                  )}

                  {!preview && (
                     <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                           <Palette className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                           <p className="font-medium text-foreground">Upload an image</p>
                           <p className="text-sm text-muted-foreground">
                              Then choose a new background
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
                  <p>Transform any image with ease using our AI-powered Background Changer. Replace your image background with a solid color, custom photo, gradient, or professional template—all within seconds. Whether you’re designing product photos, social media graphics, or profile images, this tool ensures clean, high-quality results without requiring advanced editing skills.</p>
               </div>
            </div>
         </div>
         <div className="why-use padding">
            <div className="container">
               <h2 className="text-center">Why Use This Background Changer?</h2>
               <div className="wrap">
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon1}
                           alt="Instantly replace backgrounds with AI-powered precision"
                        />
                     </div>
                     <p className="text text-center">Instantly replace backgrounds with AI-powered precision</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon2}
                           alt="Works perfectly for portraits, product photos, and graphics"
                        />
                     </div>
                     <p className="text text-center">Works perfectly for portraits, product photos, and graphics</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon3}
                           alt="No design skills or software installation required"
                        />
                     </div>
                     <p className="text text-center">No design skills or software installation required</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon4}
                           alt="Choose from solid colors, gradients, or upload your own background"
                        />
                     </div>
                     <p className="text text-center">Choose from solid colors, gradients, or upload your own background</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon5}
                           alt="Maintains high-quality output with smooth edges and clean cutouts"
                        />
                     </div>
                     <p className="text text-center">Maintains high-quality output with smooth edges and clean cutouts</p>
                  </div>
                  <div className="single">
                     <div className="icon">
                        <img
                           src={Icon6}
                           alt="Fast, browser-based tool with no login required"
                        />
                     </div>
                     <p className="text text-center">Fast, browser-based tool with no login required</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="advantages padding">
            <div className="container">
               <h2 className="text-center">Advantages of This Tool</h2>
               <div className="content">
                  <p>This tool offers a seamless way to transform images by automatically detecting the subject and generating clean cutouts suitable for any type of background replacement. Unlike manual editing tools that require time and expertise, this AI-powered solution delivers professional results instantly. It’s especially useful for eCommerce stores, content creators, influencers, and businesses that need consistent visuals. With flexible background options—solid colors, custom images, or templates—you can style your image exactly the way you want in just a few clicks.</p>
               </div>
            </div>
         </div>
         <div className="features-sec padding">
            <div className="container">
               <h2 className="text-center">Comparison With Other Background Changing Tools</h2>
               <div className="main-wrap">
                  <div className="wrap">
                     <div className="features">
                        <h3>Features</h3>
                        <ul>
                           <li>Automatic AI subject detection</li>
                           <li>Upload your own custom background</li>
                           <li>Solid colors & gradient background options</li>
                           <li>Free & unlimited usage</li>
                           <li>Fast processing in seconds</li>
                           <li>No installation required</li>
                           <li>Beginner-friendly interface</li>
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
                           <li>✔ Limited</li>
                           <li>✘ Limited</li>
                           <li>✘ Paid limits</li>
                           <li>✘ Slower</li>
                           <li>✔ </li>
                           <li>✘ Complex</li>
                        </ul>
                     </div>
                     <div className="other-tools">
                        <h3>Offline Editors</h3>
                        <ul>
                           <li>✘ Manual tool</li>
                           <li>✔</li>
                           <li>✔</li>
                           <li>✘ Subscription-based</li>
                           <li>✔</li>
                           <li>✘ Requires installation</li>
                           <li>✘ Advanced learning needed</li>
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
                     <li>1. Upload Your Image</li>
                     <li>2. AI Automatically Detects the Subject</li>
                     <li>3. Select Your New Background</li>
                     <li>4. Adjust & Preview</li>
                     <li>5. Download Your Final Image</li>
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
                           <p className="question">1. What types of backgrounds can I apply?</p>
                           <p className="answer">You can choose solid colors, gradients, templates, or upload any custom background image.</p>
                        </div>
                        <div className="single">
                           <p className="question">2. Does the tool work on product photos?</p>
                           <p className="answer">Yes, it works extremely well for product backgrounds, especially for eCommerce listings on Amazon, Flipkart, and Shopify.</p>
                        </div>
                        <div className="single">
                           <p className="question">3. Will the image quality remain the same?</p>
                           <p className="answer">Yes, the tool preserves your image resolution even after background changes.</p>
                        </div>
                        <div className="single">
                           <p className="question">4. Is this tool free to use?</p>
                           <p className="answer">Yes, all features are free, with no login or subscription required.</p>
                        </div>
                        <div className="single">
                           <p className="question">5. Can I use my own custom background?</p>
                           <p className="answer">Absolutely. You can upload any image you want to use as the new background.</p>
                        </div>
                        <div className="single">
                           <p className="question">6. Does it work on mobile devices?</p>
                           <p className="answer">Yes, the tool is fully mobile-friendly and works smoothly on all devices.</p>
                        </div>
                        <div className="single">
                           <p className="question">7. Is the background removed automatically?</p>
                           <p className="answer">Yes, the AI removes the original background and isolates the subject instantly.</p>
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
