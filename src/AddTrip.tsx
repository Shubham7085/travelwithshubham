import { useState } from 'react'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function AddTrip() {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !location || !date) return
    setLoading(true)
    await addDoc(collection(db, 'trips'), {
      title,
      location,
      date,
      createdAt: serverTimestamp(),
    })
    setTitle('')
    setLocation('')
    setDate('')
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      <h2>Naya Trip Add Karo</h2>
      <input
        placeholder="Trip Title (jaise: Manali Adventure)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Location (jaise: Manali)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={inputStyle}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? 'Adding...' : 'Add Trip'}
      </button>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 10,
  marginBottom: 12,
  borderRadius: 8,
  border: '1px solid #333',
  background: '#111',
  color: '#fff',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  background: '#00F0FF',
  color: '#000',
  fontWeight: 'bold',
  cursor: 'pointer',
}
