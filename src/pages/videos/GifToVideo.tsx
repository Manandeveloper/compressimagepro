import { useState, useRef, useEffect, useCallback } from "react";
import { FileVideo, Download, RefreshCw, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const FORMAT_OPTIONS = [
  { value: "mp4", label: "MP4 (Most Compatible)" },
  { value: "webm", label: "WebM (Web Optimized)" },
  { value: "mov", label: "MOV (Apple)" },
];

const LOOP_OPTIONS = [
  { value: "1", label: "1x (No Loop)" },
  { value: "3", label: "3x" },
  { value: "5", label: "5x" },
  { value: "10", label: "10x" },
];

export default function GifToVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState("mp4");
  const [loops, setLoops] = useState("1");
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
      toast.success("Converter ready!");
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
      setGifUrl(url);
      setVideoUrl(null);
      setProgress(0);
    }
  };

  const convertToVideo = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = "input.gif";
      const outputName = `output.${format}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const loopCount = parseInt(loops);
      
      // Build ffmpeg command based on format
      const args = ["-stream_loop", (loopCount - 1).toString(), "-i", inputName];
      
      if (format === "mp4") {
        args.push("-movflags", "faststart", "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2");
      } else if (format === "webm") {
        args.push("-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p");
      } else if (format === "mov") {
        args.push("-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2");
      }
      
      args.push(outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const mimeType = format === "webm" ? "video/webm" : format === "mov" ? "video/quicktime" : "video/mp4";
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setVideoUrl(url);
      toast.success("Video created successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert GIF");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl || !file) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}.${format}`;
    link.click();
    toast.success("Video downloaded!");
  };

  const reset = () => {
    setFile(null);
    setGifUrl(null);
    setVideoUrl(null);
    setProgress(0);
    setFormat("mp4");
    setLoops("1");
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="GIF to Video"
        description="Convert animated GIFs to video files"
        icon={FileVideo}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading converter...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="GIF to Video"
      description="Convert animated GIFs to video files"
      icon={FileVideo}
    >
      {!file ? (
        <FileUpload
          accept={{ "image/gif": [".gif"] }}
          maxFiles={1}
          maxSize={50 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
          label="Upload a GIF"
          description="Drag and drop or click to select (max 50MB)"
          fileType="image"
        />
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex justify-center overflow-hidden rounded-lg border border-border bg-muted/30 p-4">
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                className="max-h-[400px] w-auto rounded object-contain"
              />
            ) : (
              <img
                src={gifUrl || undefined}
                alt="GIF preview"
                className="max-h-[400px] w-auto rounded object-contain"
              />
            )}
          </div>

          {/* Settings */}
          {!videoUrl && (
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>Loop Count</Label>
                <Select value={loops} onValueChange={setLoops}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOOP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            {!videoUrl ? (
              <Button
                variant="gradient"
                onClick={convertToVideo}
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
                    <FileVideo className="h-4 w-4" />
                    Convert to Video
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadVideo} className="gap-2">
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
