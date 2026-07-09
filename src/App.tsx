import { useEffect, useState } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import AddTrip from './AddTrip'

interface Trip {
  id: string
  title: string
  location: string
  date: string
}

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([])

  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('date', 'desc'))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trip[]
      setTrips(data)
    })
    return () => unsub()
  }, [])

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
      <header style={{ marginBottom: 32, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00F0FF, #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TravelWithShubham 🌍
        </h1>
        <p style={{ color: '#8899b0', fontSize: 14, marginTop: 6 }}>
          Meri trips ka safarnama
        </p>
      </header>

      <AddTrip />

      <h2 style={{ fontSize: 20, marginBottom: 16, color: '#e0e0e0' }}>
        📸 Trips
      </h2>

      {trips.length === 0 && (
        <p style={{ color: '#667', textAlign: 'center', padding: 20 }}>
          अभी कोई ट्रिप नहीं है।
        </p>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {trips.map((trip) => (
          <div key={trip.id} style={tripCardStyle}>
            <h3 style={{ fontSize: 18, marginBottom: 8, color: '#fff' }}>
              {trip.title}
            </h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={tagStyle}>📍 {trip.location}</span>
              <span style={tagStyle}>📅 {trip.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const tripCardStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, #0f1626, #0a0f1a)',
  border: '1px solid #1c2740',
  borderRadius: 16,
  padding: 20,
  transition: 'transform 0.2s',
}

const tagStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#9fb0c8',
  background: '#111a2c',
  padding: '5px 12px',
  borderRadius: 20,
  border: '1px solid #1c2740',
}
