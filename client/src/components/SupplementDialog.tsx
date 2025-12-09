import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Image as ImageIcon, Music } from "lucide-react";

interface SupplementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SupplementData) => void;
}

export interface SupplementData {
  text: string;
  images: File[];
  audios: File[];
}

export function SupplementDialog({ open, onOpenChange, onSubmit }: SupplementDialogProps) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [audios, setAudios] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAudios([...audios, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = () => {
    onSubmit({ text, images, audios });
    // 重置表單
    setText("");
    setImages([]);
    setAudios([]);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>補充任務資訊</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            記錄突發狀況或補充資訊,AI 將重新分析並判斷是否需要調整任務
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 文字輸入 */}
          <div>
            <Label htmlFor="text" className="text-base font-semibold">
              文字說明
            </Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="請輸入補充說明...&#10;例如:客戶要求增加新功能、時程延後、資源不足等"
              rows={6}
              className="mt-2 resize-none"
            />
          </div>

          {/* 圖片上傳 */}
          <div>
            <Label className="text-base font-semibold">上傳圖片</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              支援格式:JPG、PNG、GIF、WEBP
            </p>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                選擇圖片
              </Button>
              {images.length > 0 && (
                <div className="space-y-2 mt-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                      <ImageIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{img.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(img.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 音檔上傳 */}
          <div>
            <Label className="text-base font-semibold">上傳音檔</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              支援格式:MP3、WAV、M4A
            </p>
            <div className="space-y-2">
              <Input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('audio-upload')?.click()}
                className="w-full"
              >
                <Music className="w-4 h-4 mr-2" />
                選擇音檔
              </Button>
              {audios.length > 0 && (
                <div className="space-y-2 mt-3">
                  {audios.map((audio, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                      <Music className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{audio.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(audio.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAudios(audios.filter((_, i) => i !== idx))}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!text && images.length === 0 && audios.length === 0}
          >
            提交並分析
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
