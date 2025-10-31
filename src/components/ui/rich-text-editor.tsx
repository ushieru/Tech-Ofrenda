'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && isEditing) {
      editorRef.current.innerHTML = value
      editorRef.current.focus()
    }
  }, [isEditing, value])

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const toggleEdit = () => {
    if (isEditing && editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
    setIsEditing(!isEditing)
  }

  return (
    <div className={`border border-orange-200 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      {isEditing && (
        <div className="flex flex-wrap gap-1 p-2 bg-orange-50 border-b border-orange-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('bold')}
            className="h-8 px-2 text-xs"
          >
            <strong>B</strong>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('italic')}
            className="h-8 px-2 text-xs"
          >
            <em>I</em>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('underline')}
            className="h-8 px-2 text-xs"
          >
            <u>U</u>
          </Button>
          <div className="w-px h-6 bg-orange-300 mx-1 self-center" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('insertUnorderedList')}
            className="h-8 px-2 text-xs"
          >
            • Lista
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('insertOrderedList')}
            className="h-8 px-2 text-xs"
          >
            1. Lista
          </Button>
          <div className="w-px h-6 bg-orange-300 mx-1 self-center" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('formatBlock', 'h3')}
            className="h-8 px-2 text-xs"
          >
            H3
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleFormat('formatBlock', 'p')}
            className="h-8 px-2 text-xs"
          >
            P
          </Button>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        {isEditing ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-[120px] p-4 focus:outline-none prose prose-sm max-w-none"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <div
            className="min-h-[120px] p-4 prose prose-sm max-w-none cursor-pointer hover:bg-orange-50/50 transition-colors"
            onClick={() => setIsEditing(true)}
            dangerouslySetInnerHTML={{ __html: value || `<p class="text-gray-500">${placeholder || 'Haz clic para editar...'}</p>` }}
          />
        )}
        
        {/* Edit/Save button */}
        <Button
          type="button"
          onClick={toggleEdit}
          className="absolute top-2 right-2 h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700"
        >
          {isEditing ? 'Guardar' : 'Editar'}
        </Button>
      </div>
    </div>
  )
}