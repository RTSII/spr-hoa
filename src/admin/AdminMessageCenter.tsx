import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { storeAdminMessage } from '../lib/supermemory'

// Helper to extract building from unit number (e.g., B2G -> B)
function getBuilding(unitNumber: string) {
  return unitNumber ? unitNumber[0].toUpperCase() : ''
}

export type AdminMessageForm = {
  title: string
  body: string
  type: 'emergency' | 'notice' | 'info'
  building: string | 'ALL'
  urgent: boolean
  broadcast: boolean
}

const initialForm: AdminMessageForm = {
  title: '',
  body: '',
  type: 'info',
  building: 'ALL',
  urgent: false,
  broadcast: true,
}

const AdminMessageCenter: React.FC = () => {
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [owners, setOwners] = useState<{ id: string; unit_number: string }[]>([])
  const [buildings, setBuildings] = useState<string[]>([])

  // Fetch unique buildings and owners for targeting
  useEffect(() => {
    supabase
      .from('owner_profiles')
      .select('id,unit_number')
      .then(({ data }) => {
        if (data) {
          setOwners(data)
          const bldgs = Array.from(new Set(data.map((o) => getBuilding(o.unit_number))))
          setBuildings(bldgs)
        }
      })
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (name === 'building') {
      setForm((f) => ({ ...f, broadcast: value === 'ALL' }))
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'emergency' | 'notice' | 'info'
    setForm((f) => ({ ...f, type, urgent: type === 'emergency' }))
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSuccess('')
    setError('')
    try {
      let recipientIds: string[] = []
      if (form.building !== 'ALL') {
        recipientIds = owners
          .filter((o) => getBuilding(o.unit_number) === form.building)
          .map((o) => o.id)
      } else {
        recipientIds = owners.map((o) => o.id)
      }
      // Send a message for each recipient (broadcast = true if ALL)
      const inserts = recipientIds.map((owner_id) => ({
        owner_id,
        type: form.type,
        title: form.title,
        body: form.body,
        urgent: form.urgent,
        broadcast: form.building === 'ALL',
      }))
      const { error } = await supabase.from('owner_messages').insert(inserts)
      if (error) throw error
      // Store in Supermemory
      try {
        const { storeAdminMessage } = await import('../lib/supermemory')
        await storeAdminMessage({
          title: form.title,
          body: form.body,
          type: form.type,
          building: form.building,
          urgent: form.urgent,
          sentAt: new Date().toISOString(),
        })
      } catch (smErr) {
        console.warn('Supermemory store failed:', smErr)
      }
      setSuccess('Message(s) sent successfully!')
      setForm(initialForm)
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Supermemory search integration
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    try {
      const { searchAdminMessages } = await import('../lib/supermemory')
      const results = await searchAdminMessages(search)
      setSearchResults(results?.results || [])
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="glass-card animate-fadeInUp mx-auto mt-10 max-w-2xl p-6">
      <h2 className="mb-6 text-2xl font-bold text-white">Admin Message Center</h2>
      {/* Supermemory Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search past admin messages (AI-powered)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass-input flex-1"
        />
        <button type="submit" className="glass-button" disabled={searching}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {searchResults.length > 0 && (
        <div className="mb-8 rounded-lg bg-white/5 p-4">
          <div className="mb-2 font-semibold text-white">Search Results:</div>
          <ul className="space-y-2">
            {searchResults.map((r, i) => (
              <li key={i} className="border-b border-white/10 pb-2">
                <div className="text-xs text-[var(--spr-blue)]">{r.tags?.join(', ')}</div>
                <div className="font-bold text-white">{r.content?.split('\n')[0]}</div>
                <div className="text-white/70">{r.content?.split('\n')[1]}</div>
                <div className="mt-1 text-xs text-white/40">{r.metadata?.sentAt}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium text-white">Message Type</label>
          <select name="type" value={form.type} onChange={handleTypeChange} className="glass-input">
            <option value="info">Info</option>
            <option value="notice">Notice</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block font-medium text-white">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="glass-input"
            maxLength={200}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-white">Body</label>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            className="glass-input"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-medium text-white">Send To</label>
          <select
            name="building"
            value={form.building}
            onChange={handleChange}
            className="glass-input"
          >
            <option value="ALL">All Owners</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                Building {b}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              name="urgent"
              checked={form.urgent}
              onChange={handleChange}
              className="mr-2"
              disabled={form.type === 'emergency'}
            />
            Mark as Urgent (future: triggers SMS/email)
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-4">
          <button type="submit" className="glass-button" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
        {success && <div className="mt-2 text-green-400">{success}</div>}
        {error && <div className="mt-2 text-red-400">{error}</div>}
      </form>
      <div className="mt-8 text-xs text-white/60">
        <p>Tip: Emergency messages are styled red and will support SMS in the future.</p>
        <p>Use "Send To" to target all owners or by building (e.g., Building B).</p>
      </div>
    </div>
  )
}

export default AdminMessageCenter
