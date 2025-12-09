import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";

// Image Tools (SEO-friendly pages)
import CompressImage from "./pages/images/CompressImage";
import ResizeImage from "./pages/images/ResizeImage";
import ConvertImage from "./pages/images/ConvertImage";
import RemoveBackground from "./pages/images/RemoveBackground";
import ChangeBackground from "./pages/images/ChangeBackground";
import CropImage from "./pages/images/CropImage";
import AddWatermark from "./pages/images/AddWatermark";
import RotateFlipImage from "./pages/images/RotateFlipImage";

// Video
import TrimVideo from "./pages/videos/TrimVideo";
import VideoToGif from "./pages/videos/VideoToGif";
import GifToVideo from "./pages/videos/GifToVideo";
import MergeVideos from "./pages/videos/MergeVideos";
import ConvertVideo from "./pages/videos/ConvertVideo";
import ExtractAudio from "./pages/videos/ExtractAudio";
import AddMusicToVideo from "./pages/videos/AddMusicToVideo";
import VideoWatermark from "./pages/videos/VideoWatermark";
import VideoSpeed from "./pages/videos/VideoSpeed";

// PDF
import MergePDFs from "./pages/pdfs/MergePDFs";
import SplitPDF from "./pages/pdfs/SplitPDF";
import CompressPDF from "./pages/pdfs/CompressPDF";

import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Image Tools (SEO URLs) */}
            <Route path="/image-compress" element={<CompressImage />} />
            <Route path="/image-resize" element={<ResizeImage />} />
            <Route path="/image-convert" element={<ConvertImage />} />
            <Route path="/image-crop" element={<CropImage />} />
            <Route path="/image-watermark" element={<AddWatermark />} />
            <Route path="/remove-background" element={<RemoveBackground />} />
            <Route path="/change-background" element={<ChangeBackground />} />
            <Route path="/rotate-image" element={<RotateFlipImage />} />

            {/* Video Tools */}
            <Route path="/videos/trim" element={<TrimVideo />} />
            <Route path="/videos/to-gif" element={<VideoToGif />} />
            <Route path="/videos/gif-to-video" element={<GifToVideo />} />
            <Route path="/videos/merge" element={<MergeVideos />} />
            <Route path="/videos/convert" element={<ConvertVideo />} />
            <Route path="/videos/extract-audio" element={<ExtractAudio />} />
            <Route path="/videos/add-music" element={<AddMusicToVideo />} />
            <Route path="/videos/watermark" element={<VideoWatermark />} />
            <Route path="/videos/speed" element={<VideoSpeed />} />
            <Route path="/videos/*" element={<ComingSoon />} />

            {/* PDF Tools */}
            <Route path="/pdfs/merge" element={<MergePDFs />} />
            <Route path="/pdfs/split" element={<SplitPDF />} />
            <Route path="/pdfs/compress" element={<CompressPDF />} />
            <Route path="/pdfs/*" element={<ComingSoon />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
