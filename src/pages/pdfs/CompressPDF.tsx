import { useState } from "react";
import { FileArchive, Download, RefreshCw, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type CompressionLevel = "low" | "medium" | "high";

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setOriginalSize(files[0].size);
      setCompressedUrl(null);
      setCompressedSize(0);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { 
        ignoreEncryption: true 
      });

      // Apply compression based on level
      const saveOptions: { useObjectStreams?: boolean; addDefaultPage?: boolean; objectsPerTick?: number } = {};
      
      if (compressionLevel === "high") {
        saveOptions.useObjectStreams = true;
        saveOptions.objectsPerTick = 50;
      } else if (compressionLevel === "medium") {
        saveOptions.useObjectStreams = true;
        saveOptions.objectsPerTick = 100;
      } else {
        saveOptions.objectsPerTick = 200;
      }

      const compressedBytes = await pdfDoc.save(saveOptions);
      const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setCompressedUrl(url);
      setCompressedSize(blob.size);

      const reduction = ((originalSize - blob.size) / originalSize * 100).toFixed(1);
      if (blob.size < originalSize) {
        toast.success(`PDF compressed! Reduced by ${reduction}%`);
      } else {
        toast.info("PDF is already optimized. Size couldn't be reduced further.");
      }
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Failed to compress PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedUrl || !file) return;
    const link = document.createElement("a");
    link.href = compressedUrl;
    link.download = `compressed-${file.name}`;
    link.click();
    toast.success("Compressed PDF downloaded!");
  };

  const reset = () => {
    setFile(null);
    setCompressedUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionLevel("medium");
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      icon={FileArchive}
    >
      {!file ? (
        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          maxSize={50 * 1024 * 1024}
          onFilesSelected={handleFilesSelected}
          label="Upload a PDF"
          description="Drag and drop or click to select (max 50MB)"
          fileType="pdf"
        />
      ) : (
        <div className="space-y-6">
          {/* File Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              Original size: {formatSize(originalSize)}
            </p>
          </div>

          {/* Compression Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Compression Level</Label>
            <RadioGroup
              value={compressionLevel}
              onValueChange={(v) => setCompressionLevel(v as CompressionLevel)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="cursor-pointer">
                  Low (Better Quality)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">
                  Medium (Balanced)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="cursor-pointer">
                  High (Smaller Size)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Results */}
          {compressedUrl && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Original</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatSize(originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compressed</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatSize(compressedSize)}
                  </p>
                </div>
              </div>
              {compressedSize < originalSize && (
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Reduced by{" "}
                  <span className="font-medium text-primary">
                    {((originalSize - compressedSize) / originalSize * 100).toFixed(1)}%
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            {!compressedUrl ? (
              <Button
                variant="gradient"
                onClick={compressPDF}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <FileArchive className="h-4 w-4" />
                    Compress PDF
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={downloadCompressed}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Compressed PDF
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
