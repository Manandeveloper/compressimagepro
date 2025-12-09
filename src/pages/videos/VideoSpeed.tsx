import { useState, useRef, useEffect, useCallback } from "react";
import { Gauge, Download, RefreshCw, Loader2 } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SPEED_PRESETS = [
  { value: 0.25, label: "0.25x (Very Slow)" },
  { value: 0.5, label: "0.5x (Slow)" },
  { value: 0.75, label: "0.75x" },
  { value: 1, label: "1x (Normal)" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x (Fast)" },
  { value: 2, label: "2x (Double)" },
  { value: 3, label: "3x" },
  { value: 4, label: "4x (Very Fast)" },
];

export default function VideoSpeed() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [preserveAudio, setPreserveAudio] = useState(true);
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
      toast.success("Speed tool ready!");
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

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setVideoUrl(URL.createObjectURL(files[0]));
      setResultUrl(null);
    }
  };

  const changeSpeed = async () => {
    if (!file || !ffmpegLoaded || speed === 1) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const ext = file.name.substring(file.name.lastIndexOf("."));

      await ffmpeg.writeFile(`input${ext}`, await fetchFile(file));

      const outputName = "output.mp4";
      const videoSpeed = 1 / speed; // setpts uses inverse
      const audioSpeed = speed;

      let args: string[];

      if (preserveAudio && speed >= 0.5 && speed <= 2) {
        // Preserve audio with pitch correction (only works for 0.5x-2x)
        args = [
          "-i", `input${ext}`,
          "-filter_complex", `[0:v]setpts=${videoSpeed}*PTS[v];[0:a]atempo=${audioSpeed}[a]`,
          "-map", "[v]",
          "-map", "[a]",
          outputName,
        ];
      } else if (preserveAudio && speed > 2) {
        // Chain atempo filters for speeds > 2x
        const tempoFilters: string[] = [];
        let remainingSpeed = audioSpeed;
        while (remainingSpeed > 2) {
          tempoFilters.push("atempo=2.0");
          remainingSpeed /= 2;
        }
        tempoFilters.push(`atempo=${remainingSpeed}`);

        args = [
          "-i", `input${ext}`,
          "-filter_complex", `[0:v]setpts=${videoSpeed}*PTS[v];[0:a]${tempoFilters.join(",")}[a]`,
          "-map", "[v]",
          "-map", "[a]",
          outputName,
        ];
      } else if (preserveAudio && speed < 0.5) {
        // Chain atempo filters for speeds < 0.5x
        const tempoFilters: string[] = [];
        let remainingSpeed = audioSpeed;
        while (remainingSpeed < 0.5) {
          tempoFilters.push("atempo=0.5");
          remainingSpeed /= 0.5;
        }
        tempoFilters.push(`atempo=${remainingSpeed}`);

        args = [
          "-i", `input${ext}`,
          "-filter_complex", `[0:v]setpts=${videoSpeed}*PTS[v];[0:a]${tempoFilters.join(",")}[a]`,
          "-map", "[v]",
          "-map", "[a]",
          outputName,
        ];
      } else {
        // No audio
        args = [
          "-i", `input${ext}`,
          "-filter:v", `setpts=${videoSpeed}*PTS`,
          "-an",
          outputName,
        ];
      }

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      toast.success(`Video speed changed to ${speed}x!`);
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to change video speed");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !file) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `${speed}x-${file.name.replace(/\.[^/.]+$/, "")}.mp4`;
    link.click();
    toast.success("Video downloaded!");
  };

  const reset = () => {
    setFile(null);
    setVideoUrl(null);
    setResultUrl(null);
    setProgress(0);
    setSpeed(1);
    setPreserveAudio(true);
  };

  const formatDuration = (originalDuration: number) => {
    const newDuration = originalDuration / speed;
    return newDuration.toFixed(1);
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Video Speed"
        description="Speed up or slow down videos"
        icon={Gauge}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading speed tool...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Video Speed"
      description="Speed up or slow down videos"
      icon={Gauge}
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
          {/* Video Preview */}
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <video
              src={resultUrl || videoUrl || undefined}
              controls
              className="mx-auto max-h-[300px] w-full object-contain"
            />
          </div>

          {/* Speed Settings */}
          {!resultUrl && (
            <div className="space-y-6 rounded-lg border border-border bg-muted/30 p-4">
              {/* Speed Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Speed</Label>
                  <span className="text-2xl font-bold text-primary">{speed}x</span>
                </div>
                <Slider
                  value={[speed]}
                  min={0.25}
                  max={4}
                  step={0.25}
                  onValueChange={(v) => setSpeed(v[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.25x (Slow)</span>
                  <span>1x</span>
                  <span>4x (Fast)</span>
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <Label className="text-sm">Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {SPEED_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={speed === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSpeed(preset.value)}
                      className="text-xs"
                    >
                      {preset.value}x
                    </Button>
                  ))}
                </div>
              </div>

              {/* Audio Options */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div>
                  <Label className="text-sm font-medium">Preserve Audio</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep audio with adjusted pitch
                  </p>
                </div>
                <Switch checked={preserveAudio} onCheckedChange={setPreserveAudio} />
              </div>

              {/* Info */}
              {speed !== 1 && (
                <div className="rounded-lg bg-primary/10 p-3 text-center text-sm">
                  <span className="text-muted-foreground">
                    {speed > 1 ? "Video will be " : "Video will be "}
                  </span>
                  <span className="font-medium text-primary">
                    {speed > 1 ? `${speed}x faster` : `${(1 / speed).toFixed(2)}x slower`}
                  </span>
                </div>
              )}
            </div>
          )}

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
            {!resultUrl ? (
              <Button
                variant="gradient"
                onClick={changeSpeed}
                disabled={isProcessing || !ffmpegLoaded || speed === 1}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gauge className="h-4 w-4" />
                    Change Speed
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
