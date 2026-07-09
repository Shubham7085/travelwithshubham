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
    <div style={{ padding: 20 }}>
      <h1>TravelWithShubham 🌍</h1>

      <AddTrip />

      <h2 style={{ marginTop: 30 }}>Trips</h2>
      {trips.length === 0 && <p>अभी कोई ट्रिप नहीं है।</p>}
      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {trips.map((trip) => (
          <div
            key={trip.id}
            style={{
              border: '1px solid #333',
              borderRadius: 10,
              padding: 16,
              background: '#111',
            }}
          >
            <h3>{trip.title}</h3>
            <p>📍 {trip.location}</p>
            <p>📅 {trip.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
