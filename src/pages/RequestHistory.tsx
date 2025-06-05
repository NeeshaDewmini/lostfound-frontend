import React, { useEffect, useState } from 'react';

interface Request {
  id: number;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  item: {
    id: number;
    name: string;
    description: string;
    status: string;
  };
}

const RequestHistory: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/requests/my', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        } else {
          console.error('Failed to fetch requests');
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchRequests();
  }, [token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Request History</h2>
      <hr />

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map((req) => (
            <li
              key={req.id}
              style={{
                border: '1px solid #ccc',
                padding: '1rem',
                marginBottom: '1rem',
                borderRadius: '6px',
              }}
            >
              <h3>{req.item.name}</h3>
              <p>{req.item.description}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <p><strong>Requested on:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestHistory;
