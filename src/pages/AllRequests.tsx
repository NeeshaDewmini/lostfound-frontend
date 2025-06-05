import React, { useEffect, useState } from 'react';

interface Request {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: { username: string };
  item: {
    id: number;
    name: string;
    description: string;
  };
}

const AllRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // You can save role on login or fetch it with /me

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        } else {
          console.error('Failed to load requests');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  const updateStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`http://localhost:8080/api/requests/${id}?status=${status}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status } : req))
        );
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>All Item Requests</h2>
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
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <h3>{req.item.name}</h3>
              <p>{req.item.description}</p>
              <p>
                <strong>Requested by:</strong> {req.user.username}
              </p>
              <p>
                <strong>Status:</strong> {req.status}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(req.createdAt).toLocaleDateString()}
              </p>

              {req.status === 'PENDING' && role === 'ADMIN' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    onClick={() => updateStatus(req.id, 'APPROVED')}
                    style={{ marginRight: '1rem' }}
                  >
                    Approve
                  </button>
                  <button onClick={() => updateStatus(req.id, 'REJECTED')}>Reject</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllRequests;
