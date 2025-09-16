export interface PostType {
  _id?: string;
  title: string;
  slug: string;
  content: EditorJsContent;
  subPage: SubPageType;
  pinned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubPageType {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  pinnedPosts?: string[]; // could also be PostType[] if populated
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EditorJsContent {
  time?: number;
  blocks: EditorJsBlock[];
  version?: string;
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
  | WarningBlock
  | AttachesBlock
  | InlineCodeBlock;

// απο εδώ και κάτω απλώς ορίζονται τα διάφορα block του editorJS

interface EditorJsBaseBlock {
  id?: string;
  type: string;
  tunes?: {
    alignment?: {
      alignment?: 'left' | 'center' | 'right' | 'justify';
    };
  };
}

interface ParagraphBlock extends EditorJsBaseBlock {
  type: 'paragraph';
  data: {
    text: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
}

interface HeaderBlock extends EditorJsBaseBlock {
  type: 'header';
  data: {
    text: string;
    level: number; // 1–6
  };
  tunes?: {
    alignment?: {
      alignment?: 'left' | 'center' | 'right' | 'justify';
    };
  };
}

interface ListBlock extends EditorJsBaseBlock {
  type: 'list';
  data: {
    style: 'ordered' | 'unordered' | 'checklist';
    items: Array<
      | string
      | {
          content: string;
          meta?: { checked?: boolean };
          items?: unknown[];
        }
    >;
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

// ✅ Attaches block
interface AttachesBlock extends EditorJsBaseBlock {
  type: 'attaches';
  data: {
    file: {
      url: string;
      name?: string;
      size?: number;
    };
    title?: string;
  };
}

// ✅ InlineCode
interface InlineCodeBlock extends EditorJsBaseBlock {
  type: 'inlineCode';
  data: {
    code: string;
  };
}
