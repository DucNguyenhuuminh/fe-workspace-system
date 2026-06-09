import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import CommentSection from "@/components/CommentSection";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
}

export default function CommentModal({ isOpen, onClose, fileId }: CommentModalProps) {
  if (!fileId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Set max-width lớn một chút để khung chat rộng rãi */}
      <DialogContent className="sm:max-w-[700px] p-0 bg-transparent border-none shadow-none h-[80vh] flex flex-col">
        {/* Ẩn DialogTitle đi để tránh warning của Radix UI, vì CommentSection đã có Header riêng */}
        <VisuallyHidden>
          <DialogTitle>Bình luận tài liệu</DialogTitle>
        </VisuallyHidden>
        
        {/* Nhúng giao diện chat vào đây */}
        <CommentSection fileId={fileId} />
      </DialogContent>
    </Dialog>
  );
}