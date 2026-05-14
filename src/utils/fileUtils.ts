import { 
  Folder as FolderIcon, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Image as ImageIcon, 
  FileArchive,
  FileVideo,
  FileAudio,
  File 
} from "lucide-react";
import type { Document, Folder } from "@/types";

// ==================== ICONS & COLORS ====================

export const getFileIcon = (mimeType: string) => {
  const mime = mimeType?.toLowerCase() || "";

  if (mime === "application/pdf") return { icon: FileText, color: "text-red-500" };
  if (mime.includes("word") || mime.includes("document")) return { icon: FileText, color: "text-blue-500" };
  if (mime.includes("spreadsheet") || mime.includes("excel") || mime === "text/csv") return { icon: FileSpreadsheet, color: "text-emerald-500" };
  if (mime.includes("presentation") || mime.includes("powerpoint")) return { icon: Presentation, color: "text-orange-500" };
  if (mime.startsWith("image/")) return { icon: ImageIcon, color: "text-purple-500" };
  if (mime.startsWith("video/")) return { icon: FileVideo, color: "text-pink-500" };
  if (mime.startsWith("audio/")) return { icon: FileAudio, color: "text-yellow-500" };
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || mime.includes("gzip")) return { icon: FileArchive, color: "text-amber-600" };

  return { icon: File, color: "text-muted-foreground" };
};

export const getFolderIcon = () => ({
  icon: FolderIcon,
  color: "text-primary",
});

// ==================== FORMATTERS ====================

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (!+bytes) return "0 B"; 

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatDate = (iso: string): string => {
  if (!iso) return "--";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "--"; 

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }); 
};

// ==================== DATA MERGERS ====================

export type FileItem =
  | { kind: "folder"; data: Folder }
  | { kind: "document"; data: Document };

export const mergeItems = (folders?: Folder[], documents?: Document[]): FileItem[] => [
  ...(folders || []).map((data) => ({ kind: "folder" as const, data })),
  ...(documents || []).map((data) => ({ kind: "document" as const, data })),
];