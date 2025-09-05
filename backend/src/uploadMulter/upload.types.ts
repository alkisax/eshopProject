

export interface IUpload extends Document {
  name: string;
  desc?: string;
  file: {
    data: Buffer;
    contentType: string;
    originalName: string;
    filename: string;
    size?: number;
    extension?: string;
  };
}

export interface IUploadLean {
  _id: string;
  name: string;
  desc?: string;
  file: {
    contentType: string;
    originalName: string;
    filename: string;
    size?: number;
    extension?: string;
    url: string;   // always included now
  };
}