import { useState, useRef, useEffect, useCallback } from "react";
import { FileType, Download, RefreshCw, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const FORMAT_OPTIONS = [
  { value: "mp4", label: "MP4", mime: "video/mp4" },
  { value: "webm", label: "WebM", mime: "video/webm" },
  { value: "mov", label: "MOV", mime: "video/quicktime" },
  { value: "avi", label: "AVI", mime: "video/x-msvideo" },
];

const QUALITY_OPTIONS = [
  { value: "high", label: "High Quality", crf: "18" },
  { value: "medium", label: "Medium (Balanced)", crf: "23" },
  { value: "low", label: "Low (Smaller File)", crf: "28" },
];

export default function ConvertVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState("mp4");
  const [quality, setQuality] = useState("medium");
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

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
      toast.success("Video converter ready!");
    } catch (error) {
      console.error("FFmpeg load error:", error);
      toast.error("Failed to load converter. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [ffmpegLoaded]);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      setConvertedUrl(null);
      setProgress(0);
    }
  };

  const getInputFormat = (filename: string) => {
    const ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    return ext;
  };

  const convertVideo = async () => {
    if (!file || !ffmpegLoaded) return;

    const inputFormat = getInputFormat(file.name);
    if (inputFormat === format) {
      toast.info("Video is already in the selected format");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = `input.${inputFormat}`;
      const outputName = `output.${format}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const crf = QUALITY_OPTIONS.find((q) => q.value === quality)?.crf || "23";
      const args: string[] = ["-i", inputName];

      // Format-specific encoding settings
      if (format === "mp4") {
        args.push("-c:v", "libx264", "-crf", crf, "-preset", "medium", "-c:a", "aac", "-b:a", "128k");
      } else if (format === "webm") {
        args.push("-c:v", "libvpx-vp9", "-crf", crf, "-b:v", "0", "-c:a", "libopus", "-b:a", "128k");
      } else if (format === "mov") {
        args.push("-c:v", "libx264", "-crf", crf, "-preset", "medium", "-c:a", "aac", "-b:a", "128k");
      } else if (format === "avi") {
        args.push("-c:v", "libx264", "-crf", crf, "-preset", "medium", "-c:a", "mp3", "-b:a", "128k");
      }

      args.push("-movflags", "+faststart", outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const mimeType = FORMAT_OPTIONS.find((f) => f.value === format)?.mime || "video/mp4";
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setConvertedUrl(url);
      toast.success(`Video converted to ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert video");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadConverted = () => {
    if (!convertedUrl || !file) return;
    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}.${format}`;
    link.click();
    toast.success("Converted video downloaded!");
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setConvertedUrl(null);
    setProgress(0);
    setFormat("mp4");
    setQuality("medium");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Convert Video"
        description="Convert videos between MP4, WebM, MOV, and AVI formats"
        icon={FileType}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading video converter...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Convert Video"
      description="Convert videos between MP4, WebM, MOV, and AVI formats"
      icon={FileType}
    >
      {!file ? (
        <FileUpload
          accept={{ "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv", ".wmv"] }}
          maxFiles={1}
          maxSize={100 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
          label="Upload a video"
          description="Drag and drop or click to select (max 100MB)"
          fileType="video"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              Size: {formatSize(file.size)} • Format: {getInputFormat(file.name).toUpperCase()}
            </p>
          </div>

          {/* Video Preview */}
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <video
              src={convertedUrl || videoUrl || undefined}
              controls
              className="mx-auto max-h-[300px] w-full object-contain"
            />
          </div>

          {/* Settings */}
          {!convertedUrl && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Output Format */}
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div className="space-y-3">
                <Label>Quality</Label>
                <RadioGroup value={quality} onValueChange={setQuality} className="space-y-2">
                  {QUALITY_OPTIONS.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value} className="cursor-pointer text-sm">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Converting... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {!convertedUrl ? (
              <Button
                variant="gradient"
                onClick={convertVideo}
                disabled={isProcessing || !ffmpegLoaded}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileType className="h-4 w-4" />
                    Convert Video
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadConverted} className="gap-2">
                <Download className="h-4 w-4" />
                Download Converted Video
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
