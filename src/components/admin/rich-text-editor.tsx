"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import ImageResize from "tiptap-extension-resize-image";
import { Mark, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  ImagePlus,
  Italic,
  Underline as UnderlineIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageCropDialog } from "@/components/shared/image-crop-dialog";
import { contentImageService } from "@/lib/api/services/content-image.service";
import { cn } from "@/lib/utils";

// Tiptap doesn't ship a stable official font-size mark yet, so we extend
// TextStyle with one — the standard, documented workaround.
const FontSize = Mark.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
});

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Sans-serif", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Serif", value: "ui-serif, Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
];

const FONT_SIZES = [
  { label: "Small", value: "13px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "X-Large", value: "28px" },
];

// `tiptap-extension-resize-image` tracks the resized width in a
// non-standard `containerstyle` attribute (used only to restore its own
// NodeView on reload). Browsers don't treat custom attributes as CSS, so
// without this override, resizing an image in the editor would never
// actually show up when the same HTML is rendered on the product page.
// This copies the width into a real `style="width:...px"` on the <img>
// so the resize is preserved everywhere the description is displayed.
const ResizableImage = ImageResize.extend({
  renderHTML({ HTMLAttributes, node }) {
    const containerStyle = node.attrs.containerStyle as string | null;
    const widthMatch = containerStyle?.match(/width:\s*([0-9.]+(?:px|%))/);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude from `rest`
    const { containerStyle: _containerStyle, wrapperStyle: _wrapperStyle, ...rest } =
      HTMLAttributes;

    return [
      "img",
      mergeAttributes(
        rest,
        widthMatch ? { style: `width: ${widthMatch[1]}; height: auto;` } : {}
      ),
    ];
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function getImageWidth(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalWidth);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src = url;
  });
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [pendingImageFile, setPendingImageFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      ResizableImage.configure({
        HTMLAttributes: { class: "rounded-lg" },
        inline: false,
        minWidth: 60,
        maxWidth: 800,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[180px] px-3.5 py-2.5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg [&_p]:my-2",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  });

  // Keep the editor in sync if `value` is reset from outside (e.g. loading
  // an existing product for edit).
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function handleCropConfirm(blob: Blob) {
    if (!editor) return;
    setUploading(true);
    try {
      const [url, naturalWidth] = await Promise.all([
        contentImageService.upload(blob),
        getImageWidth(blob),
      ]);
      // Give the image a sensible starting size (matching its real
      // resolution, capped) instead of the extension's width:100% default —
      // stretching a small crop to the full editor width is what caused it
      // to render blurry.
      const displayWidth = Math.min(naturalWidth, 480);
      editor
        .chain()
        .focus()
        .setImage({
          src: url,
          containerStyle: `width: ${displayWidth}px; height: auto; cursor: pointer;`,
        } as never)
        .run();
      setPendingImageFile(null);
    } finally {
      setUploading(false);
    }
  }

  if (!editor) return null;

  return (
    <div className={cn("overflow-hidden rounded-lg border", className)}>
      <Toolbar editor={editor} onInsertImageClick={() => fileInputRef.current?.click()} />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) setPendingImageFile(file);
          event.target.value = "";
        }}
      />
      <ImageCropDialog
        file={pendingImageFile}
        onOpenChange={(open) => !open && setPendingImageFile(null)}
        onConfirm={handleCropConfirm}
        loading={uploading}
      />
    </div>
  );
}

function Toolbar({
  editor,
  onInsertImageClick,
}: {
  editor: Editor;
  onInsertImageClick: () => void;
}) {
  return (
    <div className="bg-muted/40 flex flex-wrap items-center gap-1 border-b p-1.5">
      <ToggleButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <Bold className="size-4" />
      </ToggleButton>
      <ToggleButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <Italic className="size-4" />
      </ToggleButton>
      <ToggleButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        label="Underline"
      >
        <UnderlineIcon className="size-4" />
      </ToggleButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Select
        onValueChange={(fontFamily) =>
          fontFamily
            ? editor.chain().focus().setFontFamily(fontFamily).run()
            : editor.chain().focus().unsetFontFamily().run()
        }
      >
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.label} value={font.value || "default"}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(size) =>
          editor.chain().focus().setMark("textStyle", { fontSize: size }).run()
        }
      >
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="hover:bg-accent flex size-8 cursor-pointer items-center justify-center rounded-md">
        <input
          type="color"
          onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
          className="size-5 cursor-pointer border-none bg-transparent p-0"
          title="Font color"
        />
      </label>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToggleButton active={false} onClick={onInsertImageClick} label="Insert image">
        <ImagePlus className="size-4" />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-8"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}
