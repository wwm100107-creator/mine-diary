import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'
import s from './DiaryEditor.module.css'

// ── Inline FontSize extension (no extra package needed) ──────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: ({ fontSize }) =>
            fontSize ? { style: `font-size: ${fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: size => ({ chain }) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }) =>
        chain().setMark('textStyle', { fontSize: null }).run(),
    }
  },
})

// ── Font size options ─────────────────────────────────────────────────────────
const SIZES = [
  { label: 'Nhỏ',    value: '14px' },
  { label: 'Thường', value: '20px' },  // diary default
  { label: 'Lớn',    value: '26px' },
  { label: 'Rất lớn',value: '32px' },
]

// ── Toolbar Button ────────────────────────────────────────────────────────────
function TBtn({ title, active, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      className={`${s.toolBtn} ${active ? s.active : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >{children}</button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * DiaryEditor — TipTap rich text editor with pixel toolbar.
 * @param {{ content: string, onChange: (html: string) => void }} props
 */
export default function DiaryEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextStyle,
      FontSize,
      Underline,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        'data-placeholder': 'Bắt đầu viết… mỗi từ là một kỷ niệm nhỏ ✍',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  // Sync external content changes (e.g. switching dates)
  useEffect(() => {
    if (!editor) return
    // Only reset if content truly differs (avoids cursor jump on autosave)
    const current = editor.getHTML()
    if (current !== content) {
      editor.commands.setContent(content || '', false)
    }
  }, [content, editor])

  if (!editor) return null

  const currentSize = editor.getAttributes('textStyle').fontSize ?? '20px'

  return (
    <div className={s.editorWrap}>

      {/* Toolbar */}
      <div className={s.toolbar} role="toolbar" aria-label="Thanh định dạng">

        {/* Font size */}
        <div className={s.toolGroup}>
          <select
            className={s.fontSizeSelect}
            value={currentSize}
            onChange={e => {
              const val = e.target.value
              editor.chain().focus().setFontSize(val).run()
            }}
            aria-label="Cỡ chữ"
          >
            {SIZES.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Basic formatting */}
        <div className={s.toolGroup}>
          <TBtn
            title="Bôi đậm (Ctrl+B)"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          ><b>B</b></TBtn>

          <TBtn
            title="In nghiêng (Ctrl+I)"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          ><i>I</i></TBtn>

          <TBtn
            title="Gạch chân (Ctrl+U)"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          ><u>U</u></TBtn>

          <TBtn
            title="Gạch ngang"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          ><s>S</s></TBtn>
        </div>

        {/* Headings */}
        <div className={s.toolGroup}>
          <TBtn
            title="Tiêu đề lớn"
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >H1</TBtn>

          <TBtn
            title="Tiêu đề nhỏ"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >H2</TBtn>
        </div>

        {/* Lists */}
        <div className={s.toolGroup}>
          <TBtn
            title="Danh sách gạch đầu dòng"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <rect x="0" y="0" width="2" height="2" fill="currentColor"/>
              <rect x="4" y="0.5" width="10" height="1" fill="currentColor"/>
              <rect x="0" y="5" width="2" height="2" fill="currentColor"/>
              <rect x="4" y="5.5" width="10" height="1" fill="currentColor"/>
              <rect x="0" y="10" width="2" height="2" fill="currentColor"/>
              <rect x="4" y="10.5" width="10" height="1" fill="currentColor"/>
            </svg>
          </TBtn>

          <TBtn
            title="Danh sách đánh số"
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <text x="0" y="10" fontSize="9" fill="currentColor" fontFamily="monospace">1.</text>
              <rect x="6" y="1" width="8" height="1.5" fill="currentColor"/>
              <rect x="6" y="5.5" width="8" height="1.5" fill="currentColor"/>
              <rect x="6" y="10" width="8" height="1.5" fill="currentColor"/>
            </svg>
          </TBtn>
        </div>

        {/* Blockquote */}
        <div className={s.toolGroup}>
          <TBtn
            title="Trích dẫn"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <rect x="0" y="0" width="2" height="12" fill="currentColor" opacity="0.5"/>
              <rect x="4" y="1" width="10" height="1.5" fill="currentColor" opacity="0.7"/>
              <rect x="4" y="5" width="8" height="1.5" fill="currentColor" opacity="0.7"/>
              <rect x="4" y="9" width="6" height="1.5" fill="currentColor" opacity="0.7"/>
            </svg>
          </TBtn>
        </div>

        {/* Undo / Redo */}
        <div className={s.toolGroup}>
          <TBtn
            title="Hoàn tác (Ctrl+Z)"
            active={false}
            onClick={() => editor.chain().focus().undo().run()}
          >↩</TBtn>
          <TBtn
            title="Làm lại (Ctrl+Y)"
            active={false}
            onClick={() => editor.chain().focus().redo().run()}
          >↪</TBtn>
        </div>

      </div>

      {/* Editor content */}
      <div className={s.contentArea}>
        <EditorContent editor={editor} />
      </div>

    </div>
  )
}
