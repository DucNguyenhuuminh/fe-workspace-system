import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Loader2, File, X, Maximize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fileService } from "@/services/fileService"; 
import { toast } from "sonner"; 
import { useSearchStore } from "@/stores/searchStore";

export function SearchBar() {
  const location = useLocation();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { 
    query, 
    results, 
    isLoading, 
    isOpen, 
    setQuery, 
    setIsOpen, 
    executeSearch, 
    clearSearch 
  } = useSearchStore();

  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // === NEW STATE: MANAGE DOCUMENT PREVIEW POPUP ===
  const [previewFile, setPreviewFile] = useState<{ url: string, name: string } | null>(null);

  const currentWorkspaceId = location.pathname.match(/\/workspaces\/([a-zA-Z0-9_-]+)/)?.[1] || null;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    executeSearch(debouncedQuery, currentWorkspaceId);
  }, [debouncedQuery, location.pathname, executeSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  return (
    <>
      <div className="relative flex-1 max-w-xl" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onFocus={() => { if (query.trim().length > 0) setIsOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                executeSearch(query, currentWorkspaceId);
              }
            }}
            placeholder={
              currentWorkspaceId 
                ? "Ask AI about documents in this workspace..." 
                : "Ask AI about personal documents..."
            }
            className="pl-10 pr-10 h-10 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary transition-colors rounded-full"
          />
          
          {isLoading ? (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          ) : query ? (
            <button 
              onClick={clearSearch} 
              className="absolute right-3 p-1 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {isOpen && query.trim() !== "" && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-primary" />
                <span className="text-sm">AI is scanning document content...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-foreground">No matching documents found</p>
                <p className="text-xs mt-1">Please try a different question or keyword.</p>
              </div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto overscroll-contain 
                              [&::-webkit-scrollbar]:w-1.5 
                              [&::-webkit-scrollbar-track]:bg-transparent 
                              [&::-webkit-scrollbar-thumb]:bg-border/80 
                              [&::-webkit-scrollbar-thumb]:rounded-full
                              hover:[&::-webkit-scrollbar-thumb]:bg-border"
              >
                <div className="p-2 flex flex-col gap-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card z-10 shadow-sm">
                    Related documents ({results.length})
                  </div>
                  {results.map((hit) => {
                    const fileName = hit.originalName || "Unknown document"
                    const matchPercent = Math.max(0, Math.round(hit.score * 100));
                    const cleanPreview = hit.preview ? hit.preview.replace(/\s+/g, ' ').trim() : null;

                    return (
                      <button
                        key={hit.documentId}
                        className="flex flex-col gap-2 p-3 text-left rounded-lg hover:bg-secondary transition-colors w-full group border border-transparent hover:border-border/50 focus:bg-secondary outline-none"
                        onClick={async () => {
                          setIsOpen(false);
                          
                          // Show Loading Toast while waiting for API to fetch link
                          const toastId = toast.loading("Loading document...");
                          try {
                            const fileUrl = await fileService.getFileLink(hit.documentId, 'view');
                            toast.dismiss(toastId);
                            
                            // Open Viewer Popup instead of navigating tab
                            setPreviewFile({
                              url: fileUrl,
                              name: fileName
                            });

                          } catch(error) {
                            toast.dismiss(toastId);
                            toast.error("Cannot open this document. Please try again!");
                            console.error(error);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                              <File className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground truncate">
                              {fileName}
                            </span>
                          </div>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 border ${matchPercent > 70 ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border-orange-500/20'}`}>
                            {matchPercent}% match
                          </span>
                        </div>
                        
                        {cleanPreview && (
                          <div className="text-xs text-muted-foreground line-clamp-2 bg-background/80 p-2.5 rounded border border-border/50 italic leading-relaxed">
                            "...{cleanPreview}..."
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden bg-background border-none shadow-2xl rounded-2xl">
          <DialogHeader className="px-6 py-4 border-b bg-card flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4 text-foreground">
              {previewFile?.name}
            </DialogTitle>
            <div className="flex items-center gap-3 pr-8">
               {/* Support button to open in a new tab if the user wants more space */}
               <a 
                 href={previewFile?.url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-secondary"
               >
                 <Maximize2 className="h-3.5 w-3.5" />
                 Open in new tab
               </a>
            </div>
          </DialogHeader>
          <div className="flex-1 w-full bg-secondary/30 relative">
            {previewFile && (
              <iframe 
                src={previewFile.url} 
                className="w-full h-full border-0"
                title="Document Viewer"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}