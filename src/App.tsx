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
    <>
      <div className="hero">
        <div className="eyebrow">Personal Travel Log · Est. 2024</div>
        <h1>
          Travel<em>With</em>Shubham
        </h1>
        <p>पहाड़ों की कहानियाँ, एक-एक ट्रिप के साथ</p>
      </div>

      <div className="container">
        <AddTrip />

        <div className="section-label">Trip Log</div>

        {trips.length === 0 && (
          <div className="empty-state">अभी कोई ट्रिप दर्ज नहीं हुई है।</div>
        )}

        {trips.map((trip, i) => (
          <div key={trip.id} className="trip-card">
            <div className="trip-main">
              <h3>{trip.title}</h3>
              <div className="trip-tags">
                <span className="trip-tag">📍 {trip.location}</span>
                <span className="trip-tag">{trip.date}</span>
              </div>
            </div>
            <div className="trip-stub">
              <span>№{String(trips.length - i).padStart(2, '0')}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
