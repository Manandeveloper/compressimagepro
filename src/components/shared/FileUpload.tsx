import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, File, X, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
  label?: string;
  description?: string;
  fileType?: "image" | "video" | "pdf" | "any";
}

const fileTypeIcons = {
  image: Image,
  video: Video,
  pdf: FileText,
  any: File,
};

export function FileUpload({
  accept,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB
  onFilesSelected,
  className,
  label = "Drop files here",
  description = "or click to browse",
  fileType = "any",
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const Icon = fileTypeIcons[fileType];

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer",
          isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
          isDragReject && "border-destructive bg-destructive/5",
          !isDragActive && "border-border hover:border-primary/50 hover:bg-muted/50",
          files.length > 0 && "border-solid border-primary/30 bg-primary/5"
        )}
      >
        <input {...getInputProps()} />

        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
              isDragActive ? "gradient-primary scale-110" : "bg-muted"
            )}>
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary-foreground animate-bounce" />
              ) : (
                <Icon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} file{maxFiles > 1 ? "s" : ""} • Up to {Math.round(maxSize / 1024 / 1024)}MB each
            </p>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <p className="text-center text-xs text-muted-foreground">
              Click or drag to replace
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
