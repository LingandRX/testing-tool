import { Image, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
  selectedFile: File | null;
  onFileChange: (file: File) => void;
  onClearFile: () => void;
  previewUrl: string;
  dragging: boolean;
  onDraggingChange: (dragging: boolean) => void;
}

const ImageUploader = ({
  selectedFile,
  onFileChange,
  onClearFile,
  previewUrl,
  dragging,
  onDraggingChange,
}: ImageUploaderProps) => {
  const handleClearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClearFile();
    toast.success('图片已清除');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDraggingChange(true);
  };

  const handleDragLeave = () => {
    onDraggingChange(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDraggingChange(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileChange(droppedFile);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-[250px] border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-green-600 bg-green-50'
          : selectedFile
            ? 'border-green-600 bg-green-50/50'
            : 'border-input bg-muted hover:border-green-600 hover:bg-green-500/10'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        id="qr-code-upload"
      />
      <Label htmlFor="qr-code-upload" className="cursor-pointer text-center w-full">
        {selectedFile ? (
          <div className="text-center w-full relative">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="QR Code Preview"
                className="max-w-full max-h-40 rounded-lg object-contain"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                data-testid="ClearIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <span className="block text-sm text-muted-foreground mt-2">{selectedFile.name}</span>
            <span className="block text-xs text-muted-foreground">点击更换图片</span>
          </div>
        ) : (
          <>
            <Image
              data-testid="ImageIcon"
              className="w-12 h-12 text-muted-foreground mx-auto mb-2"
            />
            <span className="block text-sm text-muted-foreground mb-1">
              点击、拖拽或粘贴上传二维码图片
            </span>
            <span className="block text-xs text-muted-foreground">
              支持 PNG、JPG、WEBP、Base64 格式
            </span>
          </>
        )}
      </Label>
    </div>
  );
};

export default ImageUploader;
