
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import OfflineIndicator from "@/components/PWA/OfflineIndicator";
import CustomInstallBanner from "@/components/PWA/CustomInstallBanner";

const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const Gallery = lazy(() => import("./pages/Gallery"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CustomInstallBanner />
        <OfflineIndicator />
        <main>
          <BrowserRouter>
            <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/gallery/:galleryId" element={<Gallery />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </main>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
