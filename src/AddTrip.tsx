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
    <div style={cardStyle}>
      <h2 style={{ fontSize: 22, marginBottom: 20, letterSpacing: 0.5 }}>
        ✨ Naya Trip Add Karo
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Trip Title — jaise Manali Adventure"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Location — jaise Manali"
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
          {loading ? 'Adding...' : '+ Add Trip'}
        </button>
      </form>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #0f1626, #0a0f1a)',
  border: '1px solid #1c2740',
  borderRadius: 18,
  padding: 24,
  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
  marginBottom: 36,
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '14px 16px',
  marginBottom: 14,
  borderRadius: 12,
  border: '1px solid #263049',
  background: '#0a0e17',
  color: '#fff',
  fontSize: 15,
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: 14,
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(90deg, #00F0FF, #8B5CF6)',
  color: '#000',
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: 0.3,
  cursor: 'pointer',
}
