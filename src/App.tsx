import { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const querySnapshot = await getDocs(collection(db, "trips"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(data);
    };
    fetchTrips();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>TravelWithShubham 🌍</h1>
      <div style={{ display: 'grid', gap: '15px' }}>
        {trips.length === 0 ? (
          <p>अभी कोई ट्रिप नहीं है।</p>
        ) : (
          trips.map((trip: any) => (
            <div key={trip.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px' }}>
              <h2>{trip.location}</h2>
              <p>{trip.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
