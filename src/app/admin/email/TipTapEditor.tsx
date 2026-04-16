"use client";

import { useEditor, EditorContent, Mark, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Undo, 
  Redo,
  Baseline
} from "lucide-react";

// Custom extension for small text
const Small = Mark.create({
  name: 'small',
  parseHTML() {
    return [{ tag: 'small' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['small', mergeAttributes(HTMLAttributes), 0]
  },
})

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Small
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] p-6 md:p-10 font-medium italic text-secondary'
      }
    }
  });

  if (!editor) return null;

  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-3 rounded-xl transition-all ${
        isActive ? "bg-primary text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-sm focus-within:ring-4 focus-within:ring-primary/10 transition-all">
      {/* TOOLBAR */}
      <div className="bg-slate-50/50 border-b border-slate-200 p-2 md:p-3 flex flex-wrap gap-2">
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          isActive={editor.isActive('bold')}
          title="Fett"
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          isActive={editor.isActive('italic')}
          title="Kursiv"
        >
          <Italic size={18} />
        </MenuButton>
        
        <div className="w-[1px] h-6 bg-slate-200 mx-1 my-auto"></div>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleMark('small').run()} 
          isActive={editor.isActive('small')}
          title="Schrift verkleinern"
        >
          <Baseline size={18} />
        </MenuButton>

        <div className="w-[1px] h-6 bg-slate-200 mx-1 my-auto"></div>

        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          isActive={editor.isActive('heading', { level: 1 })}
          title="Überschrift 1"
        >
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          isActive={editor.isActive('heading', { level: 2 })}
          title="Überschrift 2"
        >
          <Heading2 size={18} />
        </MenuButton>
        <div className="w-[1px] h-6 bg-slate-200 mx-1 my-auto"></div>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          isActive={editor.isActive('bulletList')}
          title="Aufzählung"
        >
          <List size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          isActive={editor.isActive('orderedList')}
          title="Nummerierung"
        >
          <ListOrdered size={18} />
        </MenuButton>
        <div className="w-[1px] h-6 bg-slate-200 mx-1 my-auto lg:block hidden"></div>
        <MenuButton 
          onClick={() => editor.chain().focus().undo().run()}
          title="Rückgängig"
        >
          <Undo size={18} />
        </MenuButton>
        <MenuButton 
          onClick={() => editor.chain().focus().redo().run()}
          title="Wiederholen"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      {/* CONTENT */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
      
      <style jsx global>{`
        .ProseMirror h1 { font-size: 2.25rem; font-weight: 900; margin-bottom: 1rem; color: #1e293b; text-transform: uppercase; font-style: italic; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #1e293b; text-transform: uppercase; font-style: italic; }
        .ProseMirror p { margin-bottom: 0.5rem; line-height: 1.6; }
        .ProseMirror small { font-size: 0.85em; opacity: 0.7; font-weight: 500; display: inline-block; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
