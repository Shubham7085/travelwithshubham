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
    <div className="journal-card">
      <h2>+ नई एंट्री जोड़ें</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="field"
          placeholder="Trip Title — जैसे Manali Adventure"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="field"
          placeholder="Location — जैसे Manali"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          className="field"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Trip'}
        </button>
      </form>
    </div>
  )
}
