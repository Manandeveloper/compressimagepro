import { useState, useRef, useEffect, useCallback } from "react";
import { Film, Download, RefreshCw, Loader2, Play, Pause } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const FPS_OPTIONS = [
  { value: "10", label: "10 FPS (Smaller)" },
  { value: "15", label: "15 FPS (Balanced)" },
  { value: "20", label: "20 FPS (Smoother)" },
  { value: "30", label: "30 FPS (Best)" },
];

const WIDTH_OPTIONS = [
  { value: "320", label: "320px (Small)" },
  { value: "480", label: "480px (Medium)" },
  { value: "640", label: "640px (Large)" },
  { value: "800", label: "800px (HD)" },
];

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fps, setFps] = useState("15");
  const [width, setWidth] = useState("480");
  const [isPlaying, setIsPlaying] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
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
      toast.success("GIF converter ready!");
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
      setGifUrl(null);
      setStartTime(0);
      setEndTime(0);
      setProgress(0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(Math.min(dur, 10)); // Default max 10 seconds for GIF
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.currentTime = startTime;
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRangeChange = (values: number[]) => {
    setStartTime(values[0]);
    setEndTime(values[1]);
    if (videoRef.current) {
      videoRef.current.currentTime = values[0];
    }
  };

  const convertToGif = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.gif";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const trimDuration = endTime - startTime;
      
      // Generate palette for better quality
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", startTime.toString(),
        "-t", trimDuration.toString(),
        "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        "palette.png",
      ]);

      // Create GIF using palette
      await ffmpeg.exec([
        "-i", inputName,
        "-i", "palette.png",
        "-ss", startTime.toString(),
        "-t", trimDuration.toString(),
        "-lavfi", `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: "image/gif" });
      const url = URL.createObjectURL(blob);

      setGifUrl(url);
      toast.success("GIF created successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to create GIF");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadGif = () => {
    if (!gifUrl || !file) return;
    const link = document.createElement("a");
    link.href = gifUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}.gif`;
    link.click();
    toast.success("GIF downloaded!");
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setGifUrl(null);
    setStartTime(0);
    setEndTime(0);
    setDuration(0);
    setProgress(0);
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Video to GIF"
        description="Convert video clips to animated GIFs"
        icon={Film}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading GIF converter...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Video to GIF"
      description="Convert video clips to animated GIFs"
      icon={Film}
    >
      {!file ? (
        <FileUpload
          accept={{ "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"] }}
          maxFiles={1}
          maxSize={100 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
          label="Upload a video"
          description="Drag and drop or click to select (max 100MB)"
          fileType="video"
        />
      ) : (
        <div className="space-y-6">
          {/* Video Player / GIF Preview */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-black">
            {gifUrl ? (
              <img
                src={gifUrl}
                alt="Generated GIF"
                className="mx-auto max-h-[400px] w-auto object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl || undefined}
                  className="mx-auto max-h-[400px] w-full object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-4 left-4"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </>
            )}
          </div>

          {/* Settings */}
          {!gifUrl && (
            <>
              {/* Timeline */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Range (max 10s recommended)</Label>
                <Slider
                  value={[startTime, endTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleRangeChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(startTime)}</span>
                  <span>Duration: {formatTime(endTime - startTime)}</span>
                  <span>{formatTime(endTime)}</span>
                </div>
              </div>

              {/* Quality Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frame Rate</Label>
                  <Select value={fps} onValueChange={setFps}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FPS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Select value={width} onValueChange={setWidth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WIDTH_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
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
            {!gifUrl ? (
              <Button
                variant="gradient"
                onClick={convertToGif}
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
                    <Film className="h-4 w-4" />
                    Create GIF
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadGif} className="gap-2">
                <Download className="h-4 w-4" />
                Download GIF
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
