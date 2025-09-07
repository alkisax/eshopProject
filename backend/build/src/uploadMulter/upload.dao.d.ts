import type { IUpload, IUploadLean } from './upload.types';
declare const _default: {
    getAllUploads: () => Promise<IUploadLean[]>;
    createUpload: (imageData: Partial<IUpload>) => Promise<IUpload>;
    deleteUpload: (uploadId: string) => Promise<IUpload | null>;
};
export default _default;
