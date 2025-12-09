import { useState, useRef, useEffect, useCallback } from "react";
import { Scissors, Download, RefreshCw, Loader2, Play, Pause } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function TrimVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
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
      toast.success("Video editor ready!");
    } catch (error) {
      console.error("FFmpeg load error:", error);
      toast.error("Failed to load video editor. Please refresh and try again.");
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
      setTrimmedUrl(null);
      setStartTime(0);
      setEndTime(0);
      setProgress(0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
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
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const handleRangeChange = (values: number[]) => {
    setStartTime(values[0]);
    setEndTime(values[1]);
    if (videoRef.current) {
      videoRef.current.currentTime = values[0];
    }
  };

  const trimVideo = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const trimDuration = endTime - startTime;
      await ffmpeg.exec([
        "-i", inputName,
        "-ss", startTime.toString(),
        "-t", trimDuration.toString(),
        "-c", "copy",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setTrimmedUrl(url);
      toast.success("Video trimmed successfully!");
    } catch (error) {
      console.error("Trim error:", error);
      toast.error("Failed to trim video");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadTrimmed = () => {
    if (!trimmedUrl || !file) return;
    const link = document.createElement("a");
    link.href = trimmedUrl;
    link.download = `trimmed-${file.name.replace(/\.[^/.]+$/, "")}.mp4`;
    link.click();
    toast.success("Trimmed video downloaded!");
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setTrimmedUrl(null);
    setStartTime(0);
    setEndTime(0);
    setDuration(0);
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Trim Video"
        description="Cut and trim videos with precise start and end points"
        icon={Scissors}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading video editor...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Trim Video"
      description="Cut and trim videos with precise start and end points"
      icon={Scissors}
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
          {/* Video Player */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-black">
            <video
              ref={videoRef}
              src={trimmedUrl || videoUrl || undefined}
              className="mx-auto max-h-[400px] w-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
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
          </div>

          {/* Timeline Controls */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trim Range</Label>
              <Slider
                value={[startTime, endTime]}
                min={0}
                max={duration || 100}
                step={0.01}
                onValueChange={handleRangeChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(startTime)}</span>
                <span>Duration: {formatTime(endTime - startTime)}</span>
                <span>{formatTime(endTime)}</span>
              </div>
            </div>

            {/* Precise Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time (seconds)</Label>
                <Input
                  id="start"
                  type="number"
                  min={0}
                  max={endTime}
                  step={0.1}
                  value={startTime.toFixed(2)}
                  onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value) || 0, endTime))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Time (seconds)</Label>
                <Input
                  id="end"
                  type="number"
                  min={startTime}
                  max={duration}
                  step={0.1}
                  value={endTime.toFixed(2)}
                  onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value) || 0, startTime))}
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Processing... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {!trimmedUrl ? (
              <Button
                variant="gradient"
                onClick={trimVideo}
                disabled={isProcessing || !ffmpegLoaded}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Trimming...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4" />
                    Trim Video
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadTrimmed} className="gap-2">
                <Download className="h-4 w-4" />
                Download Trimmed Video
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
