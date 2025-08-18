import React from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  return (
    <div className="rounded border border-white/20 bg-white/10 p-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full resize-y rounded bg-transparent p-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[var(--spr-blue)]"
        placeholder="Write your post..."
      />
    </div>
  )
}

export default RichTextEditor
