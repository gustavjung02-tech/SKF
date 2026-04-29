export type UploadedImage = {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl: string;
};

export interface UploadProvider {
  upload(files: File[]): Promise<UploadedImage[]>;
}

export class LocalPreviewUploadProvider implements UploadProvider {
  async upload(files: File[]): Promise<UploadedImage[]> {
    return files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
    }));
  }
}

export const uploadProvider: UploadProvider = new LocalPreviewUploadProvider();
