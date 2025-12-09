import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, Download, RefreshCw, Loader2, Upload } from "lucide-react";
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

export default function AddMusicToVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replaceAudio, setReplaceAudio] = useState(true);
  const [audioVolume, setAudioVolume] = useState(100);
  const [originalVolume, setOriginalVolume] = useState(50);
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
      toast.success("Audio mixer ready!");
    } catch (error) {
      console.error("FFmpeg load error:", error);
      toast.error("Failed to load mixer. Please refresh and try again.");
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

  const handleAudioSelected = (files: File[]) => {
    if (files.length > 0) {
      setAudioFile(files[0]);
      setAudioUrl(URL.createObjectURL(files[0]));
      setResultUrl(null);
    }
  };

  const addMusicToVideo = async () => {
    if (!videoFile || !audioFile || !ffmpegLoaded) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      const videoExt = videoFile.name.substring(videoFile.name.lastIndexOf("."));
      const audioExt = audioFile.name.substring(audioFile.name.lastIndexOf("."));
      
      await ffmpeg.writeFile(`input${videoExt}`, await fetchFile(videoFile));
      await ffmpeg.writeFile(`audio${audioExt}`, await fetchFile(audioFile));

      const outputName = "output.mp4";
      const audioVol = audioVolume / 100;
      const origVol = originalVolume / 100;

      let args: string[];

      if (replaceAudio) {
        // Replace original audio with new audio
        args = [
          "-i", `input${videoExt}`,
          "-i", `audio${audioExt}`,
          "-c:v", "copy",
          "-map", "0:v:0",
          "-map", "1:a:0",
          "-af", `volume=${audioVol}`,
          "-shortest",
          outputName,
        ];
      } else {
        // Mix original audio with new audio
        args = [
          "-i", `input${videoExt}`,
          "-i", `audio${audioExt}`,
          "-filter_complex", `[0:a]volume=${origVol}[a0];[1:a]volume=${audioVol}[a1];[a0][a1]amix=inputs=2:duration=first[aout]`,
          "-map", "0:v:0",
          "-map", "[aout]",
          "-c:v", "copy",
          "-shortest",
          outputName,
        ];
      }

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setResultUrl(url);
      toast.success("Music added successfully!");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to add music to video");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !videoFile) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `with-music-${videoFile.name.replace(/\.[^/.]+$/, "")}.mp4`;
    link.click();
    toast.success("Video downloaded!");
  };

  const reset = () => {
    setVideoFile(null);
    setAudioFile(null);
    setVideoUrl(null);
    setAudioUrl(null);
    setResultUrl(null);
    setProgress(0);
    setReplaceAudio(true);
    setAudioVolume(100);
    setOriginalVolume(50);
  };

  if (isLoading) {
    return (
      <ToolLayout
        title="Add Music to Video"
        description="Add background music or replace audio in videos"
        icon={Volume2}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading audio mixer...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="Add Music to Video"
      description="Add background music or replace audio in videos"
      icon={Volume2}
    >
      <div className="space-y-6">
        {/* Video Upload */}
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
          <>
            {/* Video Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Video</Label>
              <div className="overflow-hidden rounded-lg border border-border bg-black">
                <video
                  src={resultUrl || videoUrl || undefined}
                  controls
                  className="mx-auto max-h-[300px] w-full object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">{videoFile.name}</p>
            </div>

            {/* Audio Upload */}
            {!audioFile ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Audio Track</Label>
                <FileUpload
                  accept={{ "audio/*": [".mp3", ".wav", ".aac", ".ogg", ".m4a"] }}
                  maxFiles={1}
                  maxSize={50 * 1024 * 1024}
                  onFilesSelected={handleAudioSelected}
                  label="Upload audio"
                  description="MP3, WAV, AAC, OGG (max 50MB)"
                  className="py-4"
                />
              </div>
            ) : (
              <>
                {/* Audio Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Audio Track</Label>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <audio src={audioUrl || undefined} controls className="w-full" />
                    <p className="mt-2 text-sm text-muted-foreground">{audioFile.name}</p>
                  </div>
                </div>

                {/* Settings */}
                {!resultUrl && (
                  <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                    {/* Replace or Mix Toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Replace Original Audio</Label>
                        <p className="text-xs text-muted-foreground">
                          {replaceAudio ? "Original audio will be removed" : "Mix with original audio"}
                        </p>
                      </div>
                      <Switch checked={replaceAudio} onCheckedChange={setReplaceAudio} />
                    </div>

                    {/* New Audio Volume */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm">Music Volume</Label>
                        <span className="text-sm text-muted-foreground">{audioVolume}%</span>
                      </div>
                      <Slider
                        value={[audioVolume]}
                        min={0}
                        max={200}
                        step={5}
                        onValueChange={(v) => setAudioVolume(v[0])}
                      />
                    </div>

                    {/* Original Audio Volume (only when mixing) */}
                    {!replaceAudio && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm">Original Audio Volume</Label>
                          <span className="text-sm text-muted-foreground">{originalVolume}%</span>
                        </div>
                        <Slider
                          value={[originalVolume]}
                          min={0}
                          max={200}
                          step={5}
                          onValueChange={(v) => setOriginalVolume(v[0])}
                        />
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
                      onClick={addMusicToVideo}
                      disabled={isProcessing || !ffmpegLoaded}
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4" />
                          Add Music
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
              </>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
