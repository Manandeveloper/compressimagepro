import { useState, useRef, useEffect, useCallback } from "react";
import { Combine, Download, RefreshCw, Loader2, GripVertical, X, Plus } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface VideoFile {
  id: string;
  file: File;
  url: string;
  duration?: number;
}

const FORMAT_OPTIONS = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "mov", label: "MOV" },
];

export default function MergeVideos() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState("mp4");
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
      toast.success("Video merger ready!");
    } catch (error) {
      console.error("FFmpeg load error:", error);
      toast.error("Failed to load merger. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [ffmpegLoaded]);

  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

  const handleFilesSelected = (files: File[]) => {
    const newVideos: VideoFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
    }));
    setVideos((prev) => [...prev, ...newVideos]);
    setMergedUrl(null);
  };

  const removeVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newVideos = [...videos];
    const draggedItem = newVideos[draggedIndex];
    newVideos.splice(draggedIndex, 1);
    newVideos.splice(index, 0, draggedItem);
    setVideos(newVideos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergeVideos = async () => {
    if (videos.length < 2 || !ffmpegLoaded) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      
      // Write all video files
      const inputFiles: string[] = [];
      for (let i = 0; i < videos.length; i++) {
        const ext = videos[i].file.name.substring(videos[i].file.name.lastIndexOf("."));
        const inputName = `input${i}${ext}`;
        await ffmpeg.writeFile(inputName, await fetchFile(videos[i].file));
        inputFiles.push(inputName);
      }

      // Create concat file
      const concatContent = inputFiles.map((f) => `file '${f}'`).join("\n");
      await ffmpeg.writeFile("concat.txt", concatContent);

      const outputName = `merged.${format}`;

      // Merge using concat demuxer
      await ffmpeg.exec([
        "-f", "concat",
        "-safe", "0",
        "-i", "concat.txt",
        "-c", "copy",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);
      const mimeType = format === "webm" ? "video/webm" : format === "mov" ? "video/quicktime" : "video/mp4";
      const blob = new Blob([data as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setMergedUrl(url);
      toast.success("Videos merged successfully!");
    } catch (error) {
      console.error("Merge error:", error);
      toast.error("Failed to merge videos. Try re-encoding option if videos have different formats.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadMerged = () => {
    if (!mergedUrl) return;
    const link = document.createElement("a");
    link.href = mergedUrl;
    link.download = `merged-video.${format}`;
    link.click();
    toast.success("Merged video downloaded!");
  };

  const reset = () => {
    setVideos([]);
    setMergedUrl(null);
    setProgress(0);
    setFormat("mp4");
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Merge Videos"
        description="Combine multiple videos into one"
        icon={Combine}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading video merger...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Merge Videos"
      description="Combine multiple videos into one"
      icon={Combine}
    >
      {videos.length === 0 ? (
        <FileUpload
          accept={{ "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"] }}
          maxFiles={10}
          maxSize={100 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
          label="Upload videos"
          description="Drag and drop or click to select (max 10 videos, 100MB each)"
          fileType="video"
        />
      ) : (
        <div className="space-y-6">
          {/* Merged Result */}
          {mergedUrl && (
            <div className="overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-4">
              <Label className="mb-2 block text-sm font-medium">Merged Video</Label>
              <video
                src={mergedUrl}
                controls
                className="mx-auto max-h-[300px] w-full rounded object-contain"
              />
            </div>
          )}

          {/* Video List */}
          {!mergedUrl && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Videos (drag to reorder)</Label>
              <div className="space-y-2">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all ${
                      draggedIndex === index ? "opacity-50" : ""
                    }`}
                  >
                    <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <video
                      src={video.url}
                      className="h-12 w-20 rounded object-cover"
                    />
                    <span className="flex-1 truncate text-sm text-foreground">
                      {video.file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVideo(video.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add More */}
              <FileUpload
                accept={{ "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"] }}
                maxFiles={10 - videos.length}
                maxSize={100 * 1024 * 1024}
                onFilesSelected={handleFilesSelected}
                label="Add more videos"
                description=""
                className="border-dashed py-4"
                fileType="video"
              />
            </div>
          )}

          {/* Format Selection */}
          {!mergedUrl && (
            <div className="max-w-xs space-y-2">
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
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Merging videos... {progress}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {!mergedUrl ? (
              <Button
                variant="gradient"
                onClick={mergeVideos}
                disabled={isProcessing || !ffmpegLoaded || videos.length < 2}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Combine className="h-4 w-4" />
                    Merge Videos
                  </>
                )}
              </Button>
            ) : (
              <Button variant="gradient" onClick={downloadMerged} className="gap-2">
                <Download className="h-4 w-4" />
                Download Merged Video
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
