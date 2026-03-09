import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Pencil, Check, X, Bold, Italic, Heading2, List } from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'
import { updateProduct } from '../../lib/api'
import toast from 'react-hot-toast'

export default function InlineDescriptionEditor({ productId, description, onUpdate }) {
  const { isAdmin, isSeller } = useAuth()
  const canEdit = isAdmin || isSeller
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(description || '')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await updateProduct(productId, { description: value })
      if (error) {
        toast.error('Ошибка сохранения')
        return
      }
      toast.success('Описание обновлено')
      onUpdate?.(value)
      setEditing(false)
    } catch {
      toast.error('Ошибка сети')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(description || '')
    setEditing(false)
  }

  const insertMarkdown = (prefix, suffix = '') => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.substring(start, end)
    const before = value.substring(0, start)
    const after = value.substring(end)
    const newValue = before + prefix + selected + suffix + after
    setValue(newValue)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  /* ---- View mode ---- */
  if (!editing) {
    return (
      <div className="group relative">
        <div
          className="vintage-description font-body text-lg leading-relaxed"
          style={{ color: 'rgba(44, 36, 32, 0.6)' }}
        >
          {description ? (
            <ReactMarkdown>{description}</ReactMarkdown>
          ) : (
            <span style={{ color: 'rgba(44, 36, 32, 0.25)', fontStyle: 'italic' }}>
              Нет описания
            </span>
          )}
        </div>

        {canEdit && (
          <button
            onClick={() => { setValue(description || ''); setEditing(true) }}
            className="absolute top-0 right-0 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              backgroundColor: 'rgba(176, 141, 87, 0.1)',
              color: '#B08D57',
            }}
            title="Редактировать описание"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
    )
  }

  /* ---- Edit mode ---- */
  return (
    <div
      className="rounded"
      style={{
        border: '1px solid rgba(176, 141, 87, 0.3)',
        backgroundColor: 'rgba(255, 252, 245, 0.5)',
      }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(176, 141, 87, 0.15)' }}
      >
        <ToolbarButton icon={Bold} onClick={() => insertMarkdown('**', '**')} title="Жирный" />
        <ToolbarButton icon={Italic} onClick={() => insertMarkdown('*', '*')} title="Курсив" />
        <ToolbarButton icon={Heading2} onClick={() => insertMarkdown('\n## ', '\n')} title="Заголовок" />
        <ToolbarButton icon={List} onClick={() => insertMarkdown('\n- ')} title="Список" />

        <div className="flex-1" />

        <button
          onClick={handleCancel}
          className="p-1.5 rounded transition-colors hover:bg-black/5"
          style={{ color: 'rgba(44, 36, 32, 0.4)' }}
          title="Отменить"
        >
          <X size={16} />
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1.5 rounded transition-colors hover:bg-black/5 disabled:opacity-40"
          style={{ color: '#B08D57' }}
          title="Сохранить"
        >
          <Check size={16} />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-3 font-body text-base resize-y focus:outline-none"
        style={{
          backgroundColor: 'transparent',
          color: '#2C2420',
          minHeight: '180px',
          lineHeight: '1.7',
        }}
        autoFocus
        placeholder="Описание товара..."
      />

      {/* Hint */}
      <div
        className="px-4 py-2 font-body text-[10px]"
        style={{
          color: 'rgba(44, 36, 32, 0.3)',
          borderTop: '1px solid rgba(176, 141, 87, 0.1)',
        }}
      >
        **жирный** &nbsp; *курсив* &nbsp; ## заголовок &nbsp; - список
      </div>
    </div>
  )
}

function ToolbarButton({ icon: Icon, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded transition-colors hover:bg-black/5"
      style={{ color: 'rgba(44, 36, 32, 0.5)' }}
    >
      <Icon size={14} />
    </button>
  )
}
