import { useState, useCallback } from "react";
import { Split, Download, RefreshCw, FileText, Check } from "lucide-react";
import { ToolLayout } from "@/components/shared/ToolLayout";
import { FileUpload } from "@/components/shared/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PDFDocument } from "pdf-lib";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SplitMode = "all" | "range" | "select";

interface SplitResult {
  pageNumber: number;
  url: string;
  blob: Blob;
}

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<SplitMode>("all");
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [splitResults, setSplitResults] = useState<SplitResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setSplitResults([]);

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        setRangeEnd(count);
        setSelectedPages([]);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Failed to load PDF");
      }
    }
  }, []);

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum)
        ? prev.filter((p) => p !== pageNum)
        : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const splitPDF = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const results: SplitResult[] = [];

      let pagesToExtract: number[] = [];

      if (splitMode === "all") {
        pagesToExtract = Array.from({ length: pageCount }, (_, i) => i);
      } else if (splitMode === "range") {
        pagesToExtract = Array.from(
          { length: rangeEnd - rangeStart + 1 },
          (_, i) => rangeStart - 1 + i
        );
      } else if (splitMode === "select") {
        pagesToExtract = selectedPages.map((p) => p - 1);
      }

      if (pagesToExtract.length === 0) {
        toast.error("No pages selected");
        setIsProcessing(false);
        return;
      }

      // Create individual PDFs for each page
      for (const pageIndex of pagesToExtract) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        results.push({
          pageNumber: pageIndex + 1,
          url,
          blob,
        });
      }

      setSplitResults(results);
      toast.success(`Split into ${results.length} PDF${results.length > 1 ? "s" : ""}!`);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      toast.error("Failed to split PDF");
    } finally {
      setIsProcessing(false);
    }
  }, [file, splitMode, pageCount, rangeStart, rangeEnd, selectedPages]);

  const downloadSingle = (result: SplitResult, fileName: string) => {
    const link = document.createElement("a");
    link.href = result.url;
    link.download = `${fileName}_page_${result.pageNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    if (splitResults.length === 0 || !file) return;

    const baseName = file.name.replace(/\.pdf$/i, "");

    for (const result of splitResults) {
      downloadSingle(result, baseName);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    toast.success("All downloads started!");
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setSplitResults([]);
    setSelectedPages([]);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract pages from PDF files into separate documents"
      icon={Split}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Upload & Settings */}
        <div className="space-y-6">
          <FileUpload
            accept={{ "application/pdf": [".pdf"] }}
            onFilesSelected={handleFilesSelected}
            fileType="pdf"
            label="Drop your PDF here"
            description="Select a PDF to split"
          />

          {file && pageCount > 0 && (
            <div className="space-y-6 animate-slide-up">
              {/* File Info */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <FileText className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pageCount} page{pageCount !== 1 ? "s" : ""} •{" "}
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Split Mode */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                <h4 className="text-sm font-medium">Split Mode</h4>
                <div className="flex rounded-xl border border-border bg-background p-1">
                  {(["all", "range", "select"] as SplitMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSplitMode(mode)}
                      className={cn(
                        "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        splitMode === mode
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {mode === "all" && "All Pages"}
                      {mode === "range" && "Page Range"}
                      {mode === "select" && "Select Pages"}
                    </button>
                  ))}
                </div>

                {/* Range Selection */}
                {splitMode === "range" && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        From
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={pageCount}
                        value={rangeStart}
                        onChange={(e) =>
                          setRangeStart(
                            Math.min(Math.max(1, Number(e.target.value)), pageCount)
                          )
                        }
                      />
                    </div>
                    <span className="mt-5 text-muted-foreground">to</span>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs text-muted-foreground">
                        To
                      </label>
                      <Input
                        type="number"
                        min={rangeStart}
                        max={pageCount}
                        value={rangeEnd}
                        onChange={(e) =>
                          setRangeEnd(
                            Math.min(
                              Math.max(rangeStart, Number(e.target.value)),
                              pageCount
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Page Selection */}
                {splitMode === "select" && (
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Click to select pages ({selectedPages.length} selected)
                    </p>
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => togglePageSelection(pageNum)}
                            className={cn(
                              "relative flex h-10 items-center justify-center rounded-lg border-2 text-sm font-medium transition-all",
                              selectedPages.includes(pageNum)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {pageNum}
                            {selectedPages.includes(pageNum) && (
                              <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={splitPDF}
                  disabled={
                    isProcessing ||
                    (splitMode === "select" && selectedPages.length === 0)
                  }
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Splitting...
                    </>
                  ) : (
                    <>
                      <Split className="mr-2 h-4 w-4" />
                      Split PDF
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={reset}>
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {splitResults.length > 0 ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium">Split Results</h4>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                  {splitResults.length} PDF{splitResults.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4">
                {splitResults.map((result) => (
                  <div
                    key={result.pageNumber}
                    className="flex items-center gap-3 rounded-lg bg-card p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {result.pageNumber}
                    </div>
                    <span className="flex-1 text-sm">Page {result.pageNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        downloadSingle(result, file?.name.replace(/\.pdf$/i, "") || "split")
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="gradient"
                className="mt-4 w-full"
                onClick={downloadAll}
              >
                <Download className="mr-2 h-4 w-4" />
                Download All ({splitResults.length} files)
              </Button>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Split className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {!file ? "Upload a PDF to split" : "Choose pages and click Split"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Extract specific pages into separate files
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
