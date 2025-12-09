import { useState, useRef, useEffect, useCallback } from "react";
import { Music, Download, RefreshCw, Loader2 } from "lucide-react";
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
  { value: "mp3", label: "MP3 (Most Compatible)", mime: "audio/mpeg" },
  { value: "wav", label: "WAV (Lossless)", mime: "audio/wav" },
  { value: "aac", label: "AAC (High Quality)", mime: "audio/aac" },
  { value: "ogg", label: "OGG (Open Format)", mime: "audio/ogg" },
];

const QUALITY_OPTIONS = [
  { value: "320", label: "320 kbps (Best)" },
  { value: "256", label: "256 kbps (High)" },
  { value: "192", label: "192 kbps (Good)" },
  { value: "128", label: "128 kbps (Standard)" },
];

export default function ExtractAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192");
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
      toast.success("Audio extractor ready!");
    } catch (error) {
      console.error("FFmpeg load error:", error);
      toast.error("Failed to load extractor. Please refresh and try again.");
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
      setAudioUrl(null);
      setProgress(0);
    }
  };

  const extractAudio = async () => {
    if (!file || !ffmpegLoaded) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const ext = file.name.substring(file.name.lastIndexOf("."));
      const inputName = `input${ext}`;
      const outputName = `output.${format}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const args: string[] = ["-i", inputName, "-vn"];

      if (format === "mp3") {
        args.push("-c:a", "libmp3lame", "-b:a", `${bitrate}k`);
      } else if (format === "wav") {
        args.push("-c:a", "pcm_s16le");
      } else if (format === "aac") {
        args.push("-c:a", "aac", "-b:a", `${bitrate}k`);
      } else if (format === "ogg") {
        args.push("-c:a", "libvorbis", "-b:a", `${bitrate}k`);
      }

      args.push(outputName);

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const mimeType = FORMAT_OPTIONS.find((f) => f.value === format)?.mime || "audio/mpeg";
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      toast.success("Audio extracted successfully!");
    } catch (error) {
      console.error("Extraction error:", error);
      toast.error("Failed to extract audio");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadAudio = () => {
    if (!audioUrl || !file) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}.${format}`;
    link.click();
    toast.success("Audio downloaded!");
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setAudioUrl(null);
    setProgress(0);
    setFormat("mp3");
    setBitrate("192");
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
        title="Extract Audio"
        description="Extract audio from videos as MP3, WAV, AAC, or OGG"
        icon={Music}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading audio extractor...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Extract Audio"
      description="Extract audio from videos as MP3, WAV, AAC, or OGG"
      icon={Music}
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
            <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
          </div>

          {/* Video Preview */}
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <video
              src={videoUrl || undefined}
              controls
              className="mx-auto max-h-[250px] w-full object-contain"
            />
          </div>

          {/* Audio Preview */}
          {audioUrl && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Label className="mb-2 block text-sm font-medium">Extracted Audio</Label>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}

          {/* Settings */}
          {!audioUrl && (
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

              {/* Quality (not for WAV) */}
              {format !== "wav" && (
                <div className="space-y-3">
                  <Label>Bitrate</Label>
                  <RadioGroup value={bitrate} onValueChange={setBitrate} className="space-y-2">
                    {QUALITY_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={`br-${opt.value}`} />
                        <Label htmlFor={`br-${opt.value}`} className="cursor-pointer text-sm">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Extracting audio... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {!audioUrl ? (
              <Button
                variant="gradient"
                onClick={extractAudio}
                disabled={isProcessing || !ffmpegLoaded}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Music className="h-4 w-4" />
                    Extract Audio
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadAudio} className="gap-2">
                <Download className="h-4 w-4" />
                Download Audio
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
