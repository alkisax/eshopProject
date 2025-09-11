import { Types } from 'mongoose';

export interface PostType {
  _id?: Types.ObjectId;
  content: EditorJsContent;
  subPage: Types.ObjectId | SubPageType | string;
  pinned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubPageType {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  pinnedPosts?: (Types.ObjectId | string)[]; // could also be PostType[] if populated
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EditorJsContent {
  time: number;
  blocks: EditorJsBlock[];
  version: string;
}

export type EditorJsBlock =
  | ParagraphBlock
  | HeaderBlock
  | ListBlock
  | ImageBlock
  | QuoteBlock
  | CodeBlock
  | TableBlock
  | ChecklistBlock
  | DelimiterBlock
  | EmbedBlock
  | WarningBlock;


interface EditorJsBaseBlock {
  id?: string;
  type: string;
}

interface ParagraphBlock extends EditorJsBaseBlock {
  type: 'paragraph';
  data: {
    text: string;
  };
}

interface HeaderBlock extends EditorJsBaseBlock {
  type: 'header';
  data: {
    text: string;
    level: number; // 1–6
  };
}

interface ListBlock extends EditorJsBaseBlock {
  type: 'list';
  data: {
    style: 'ordered' | 'unordered';
    items: string[];
  };
}

interface ImageBlock extends EditorJsBaseBlock {
  type: 'image';
  data: {
    file: {
      url: string;
    };
    caption?: string;
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
  };
}

// ✅ Quote
interface QuoteBlock extends EditorJsBaseBlock {
  type: 'quote';
  data: {
    text: string;
    caption?: string;
    alignment?: 'left' | 'center';
  };
}

// ✅ Code
interface CodeBlock extends EditorJsBaseBlock {
  type: 'code';
  data: {
    code: string;
  };
}

// ✅ Table
interface TableBlock extends EditorJsBaseBlock {
  type: 'table';
  data: {
    content: string[][];
    withHeadings?: boolean;
  };
}

// ✅ Checklist
interface ChecklistBlock extends EditorJsBaseBlock {
  type: 'checklist';
  data: {
    items: { text: string; checked: boolean }[];
  };
}

// ✅ Delimiter
interface DelimiterBlock extends EditorJsBaseBlock {
  type: 'delimiter';
  data: Record<string, never>; // no config
}

// ✅ Embed
interface EmbedBlock extends EditorJsBaseBlock {
  type: 'embed';
  data: {
    service: string; // youtube, twitter, etc.
    source: string;
    embed: string;
    width?: number;
    height?: number;
    caption?: string;
  };
}

// ✅ Warning
interface WarningBlock extends EditorJsBaseBlock {
  type: 'warning';
  data: {
    title: string;
    message: string;
  };
}
