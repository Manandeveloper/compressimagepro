import { useState, useRef, useEffect, useCallback } from "react";
import { Stamp, Download, RefreshCw, Loader2, Type, ImageIcon } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const POSITION_OPTIONS = [
  { value: "top-left", label: "Top Left", x: "10", y: "10" },
  { value: "top-center", label: "Top Center", x: "(w-text_w)/2", y: "10" },
  { value: "top-right", label: "Top Right", x: "w-tw-10", y: "10" },
  { value: "center", label: "Center", x: "(w-text_w)/2", y: "(h-text_h)/2" },
  { value: "bottom-left", label: "Bottom Left", x: "10", y: "h-th-10" },
  { value: "bottom-center", label: "Bottom Center", x: "(w-text_w)/2", y: "h-th-10" },
  { value: "bottom-right", label: "Bottom Right", x: "w-tw-10", y: "h-th-10" },
];

const IMAGE_POSITIONS = [
  { value: "top-left", label: "Top Left", position: "10:10" },
  { value: "top-right", label: "Top Right", position: "W-w-10:10" },
  { value: "bottom-left", label: "Bottom Left", position: "10:H-h-10" },
  { value: "bottom-right", label: "Bottom Right", position: "W-w-10:H-h-10" },
  { value: "center", label: "Center", position: "(W-w)/2:(H-h)/2" },
];

export default function VideoWatermark() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Text watermark settings
  const [watermarkText, setWatermarkText] = useState("Watermark");
  const [textPosition, setTextPosition] = useState("bottom-right");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textOpacity, setTextOpacity] = useState(80);

  // Image watermark settings
  const [imagePosition, setImagePosition] = useState("bottom-right");
  const [imageScale, setImageScale] = useState(20);
  const [imageOpacity, setImageOpacity] = useState(80);

  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");

  const ffmpegRef = useRef(new FFmpeg());

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegLoaded) return;
    setIsLoading(true);
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setFfmpegLoaded(true);
      toast.success("Watermark tool ready!");
    } catch (error) {
      console.error("FFmpeg load error:", error);
      toast.error("Failed to load tool. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [ffmpegLoaded]);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  const handleVideoSelected = (files: File[]) => {
    if (files.length > 0) {
      setVideoFile(files[0]);
      setVideoUrl(URL.createObjectURL(files[0]));
      setResultUrl(null);
    }
  };

  const handleImageSelected = (files: File[]) => {
    if (files.length > 0) {
      setImageFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
      setResultUrl(null);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `0x${result[1]}${result[2]}${result[3]}`
      : "0xffffff";
  };

  const addWatermark = async () => {
    if (!videoFile || !ffmpegLoaded) return;
    if (watermarkType === "image" && !imageFile) {
      toast.error("Please upload a watermark image");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const videoExt = videoFile.name.substring(videoFile.name.lastIndexOf("."));

      await ffmpeg.writeFile(`input${videoExt}`, await fetchFile(videoFile));

      const outputName = "output.mp4";
      let args: string[];

      if (watermarkType === "text") {
        const pos = POSITION_OPTIONS.find((p) => p.value === textPosition);
        const alpha = textOpacity / 100;
        const color = hexToRgb(textColor);

        args = [
          "-i", `input${videoExt}`,
          "-vf", `drawtext=text='${watermarkText}':fontsize=${fontSize}:fontcolor=${color}@${alpha}:x=${pos?.x || "10"}:y=${pos?.y || "10"}`,
          "-c:a", "copy",
          outputName,
        ];
      } else {
        const imgExt = imageFile!.name.substring(imageFile!.name.lastIndexOf("."));
        await ffmpeg.writeFile(`watermark${imgExt}`, await fetchFile(imageFile!));

        const pos = IMAGE_POSITIONS.find((p) => p.value === imagePosition);
        const alpha = imageOpacity / 100;
        const scale = imageScale / 100;

        args = [
          "-i", `input${videoExt}`,
          "-i", `watermark${imgExt}`,
          "-filter_complex", `[1:v]scale=iw*${scale}:ih*${scale},format=rgba,colorchannelmixer=aa=${alpha}[wm];[0:v][wm]overlay=${pos?.position || "10:10"}`,
          "-c:a", "copy",
          outputName,
        ];
      }

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      toast.success("Watermark added successfully!");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to add watermark");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !videoFile) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `watermarked-${videoFile.name.replace(/\.[^/.]+$/, "")}.mp4`;
    link.click();
    toast.success("Video downloaded!");
  };

  const reset = () => {
    setVideoFile(null);
    setImageFile(null);
    setVideoUrl(null);
    setImageUrl(null);
    setResultUrl(null);
    setProgress(0);
    setWatermarkText("Watermark");
    setTextPosition("bottom-right");
    setFontSize(24);
    setTextColor("#ffffff");
    setTextOpacity(80);
    setImagePosition("bottom-right");
    setImageScale(20);
    setImageOpacity(80);
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Video Watermark"
        description="Add text or image watermarks to videos"
        icon={Stamp}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading watermark tool...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Video Watermark"
      description="Add text or image watermarks to videos"
      icon={Stamp}
    >
      {!videoFile ? (
        <FileUpload
          accept={{ "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"] }}
          maxFiles={1}
          maxSize={100 * 1024 * 1024}
          onFilesSelected={handleVideoSelected}
          label="Upload a video"
          description="Drag and drop or click to select (max 100MB)"
          fileType="video"
        />
      ) : (
        <div className="space-y-6">
          {/* Video Preview */}
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <video
              src={resultUrl || videoUrl || undefined}
              controls
              className="mx-auto max-h-[300px] w-full object-contain"
            />
          </div>

          {/* Watermark Settings */}
          {!resultUrl && (
            <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as "text" | "image")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <Type className="h-4 w-4" />
                  Text Watermark
                </TabsTrigger>
                <TabsTrigger value="image" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image Watermark
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Enter watermark text"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={textPosition} onValueChange={setTextPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10 w-14 cursor-pointer p-1"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Font Size</Label>
                    <span className="text-sm text-muted-foreground">{fontSize}px</span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    min={12}
                    max={72}
                    step={2}
                    onValueChange={(v) => setFontSize(v[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Opacity</Label>
                    <span className="text-sm text-muted-foreground">{textOpacity}%</span>
                  </div>
                  <Slider
                    value={[textOpacity]}
                    min={10}
                    max={100}
                    step={5}
                    onValueChange={(v) => setTextOpacity(v[0])}
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 pt-4">
                {!imageFile ? (
                  <FileUpload
                    accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024}
                    onFilesSelected={handleImageSelected}
                    label="Upload watermark image"
                    description="PNG with transparency recommended (max 10MB)"
                    fileType="image"
                    className="py-4"
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3">
                      <img
                        src={imageUrl || undefined}
                        alt="Watermark"
                        className="h-16 w-16 rounded object-contain"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{imageFile.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setImageUrl(null);
                          }}
                          className="mt-1 h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select value={imagePosition} onValueChange={setImagePosition}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_POSITIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Scale</Label>
                        <span className="text-sm text-muted-foreground">{imageScale}%</span>
                      </div>
                      <Slider
                        value={[imageScale]}
                        min={5}
                        max={50}
                        step={5}
                        onValueChange={(v) => setImageScale(v[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Opacity</Label>
                        <span className="text-sm text-muted-foreground">{imageOpacity}%</span>
                      </div>
                      <Slider
                        value={[imageOpacity]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={(v) => setImageOpacity(v[0])}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Adding watermark... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {!resultUrl ? (
              <Button
                variant="gradient"
                onClick={addWatermark}
                disabled={isProcessing || !ffmpegLoaded || (watermarkType === "text" && !watermarkText)}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Stamp className="h-4 w-4" />
                    Add Watermark
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadResult} className="gap-2">
                <Download className="h-4 w-4" />
                Download Video
              </Button>
            )}
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
