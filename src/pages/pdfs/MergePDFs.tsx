import { useState, useCallback } from "react";
import { Merge, Download, RefreshCw, GripVertical, Trash2, Plus } from "lucide-react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

interface PDFFile {
  id: string;
  file: File;
  pageCount: number;
}

export default function MergePDFs() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newPdfFiles: PDFFile[] = [];

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        newPdfFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          pageCount,
        });
      } catch (error) {
        console.error(`Error loading ${file.name}:`, error);
        toast.error(`Failed to load ${file.name}`);
      }
    }

    setPdfFiles((prev) => [...prev, ...newPdfFiles]);
    setMergedUrl(null);
  }, []);

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedUrl(null);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...pdfFiles];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);
    setPdfFiles(newFiles);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const mergePDFs = useCallback(async () => {
    if (pdfFiles.length < 2) {
      toast.error("Please add at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setMergedUrl(url);
      toast.success(`Successfully merged ${pdfFiles.length} PDFs!`);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      toast.error("Failed to merge PDFs");
    } finally {
      setIsProcessing(false);
    }
  }, [pdfFiles]);

  const downloadPDF = useCallback(() => {
    if (!mergedUrl) return;

    const link = document.createElement("a");
    link.href = mergedUrl;
    link.download = "merged.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started!");
  }, [mergedUrl]);

  const reset = () => {
    setPdfFiles([]);
    setMergedUrl(null);
  };

  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0);

  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDF files into a single document"
      icon={Merge}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Upload & File List */}
        <div className="space-y-6">
          <FileUpload
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={20}
            onFilesSelected={handleFilesSelected}
            fileType="pdf"
            label="Drop PDF files here"
            description="Add multiple PDFs to merge"
          />

          {pdfFiles.length > 0 && (
            <div className="space-y-4 animate-slide-up">
              {/* File List */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-medium">
                    Files to merge ({pdfFiles.length})
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Drag to reorder
                  </span>
                </div>

                <div className="space-y-2">
                  {pdfFiles.map((pdfFile, index) => (
                    <div
                      key={pdfFile.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all cursor-move ${
                        draggedIndex === index ? "opacity-50" : ""
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-sm font-semibold text-destructive">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {pdfFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pdfFile.pageCount} page{pdfFile.pageCount !== 1 ? "s" : ""} •{" "}
                          {(pdfFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile(pdfFile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add More Files
                </Button>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-medium">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total files:</span>
                    <span className="ml-2 font-semibold">{pdfFiles.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total pages:</span>
                    <span className="ml-2 font-semibold">{totalPages}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={mergePDFs}
                  disabled={isProcessing || pdfFiles.length < 2}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <Merge className="mr-2 h-4 w-4" />
                      Merge PDFs
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={reset}>
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview/Result */}
        <div className="space-y-4">
          {mergedUrl ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium">Merged PDF Ready</h4>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                  {totalPages} pages
                </span>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                <iframe
                  src={mergedUrl}
                  className="h-96 w-full"
                  title="Merged PDF Preview"
                />
              </div>

              <Button
                variant="gradient"
                className="mt-4 w-full"
                onClick={downloadPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Merged PDF
              </Button>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Merge className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {pdfFiles.length === 0
                    ? "Add PDF files to merge"
                    : pdfFiles.length === 1
                    ? "Add at least one more PDF"
                    : "Click 'Merge PDFs' to combine"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag files to reorder them
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
