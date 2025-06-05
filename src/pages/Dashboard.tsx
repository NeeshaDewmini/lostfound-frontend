import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaClipboardList, FaCheckCircle, FaSearch, FaUserAlt, FaSignOutAlt } from 'react-icons/fa';


import './Dashboard.css'; 

interface User {
  id: number;
  username: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
}

interface Item {
  id: number;
  name: string;
  description: string;
  status: 'LOST' | 'FOUND' | 'CLAIMED';
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [claimedItems, setClaimedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchUser = async () => {
    const res = await fetch('http://localhost:8080/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUser(data);
  };

  const fetchItems = async (status: string) => {
    const res = await fetch(`http://localhost:8080/api/items/status/${status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    await fetchUser();
    const [lost, found, claimed] = await Promise.all([
      fetchItems('LOST'),
      fetchItems('FOUND'),
      fetchItems('CLAIMED'),
    ]);
    setLostItems(lost);
    setFoundItems(found);
    setClaimedItems(claimed);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequest = async (itemId: number) => {
    const res = await fetch('http://localhost:8080/api/requests', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user?.id, itemId }),
    });

    if (res.ok) {
      alert('Request submitted!');
    } else {
      const error = await res.text();
      alert('Request failed: ' + error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOST':
        return <span className="badge bg-danger">Lost</span>;
      case 'FOUND':
        return <span className="badge bg-success">Found</span>;
      case 'CLAIMED':
        return <span className="badge bg-secondary">Claimed</span>;
      default:
        return null;
    }
  };

  const renderItemList = (items: Item[], status: string) => (
    <div className="mb-5">
      <h3 className="mb-4 d-flex align-items-center gap-2 text-primary">
        {status === 'LOST' && <FaSearch />}
        {status === 'FOUND' && <FaClipboardList />}
        {status === 'CLAIMED' && <FaCheckCircle />}
        {status} Items
      </h3>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" aria-label="Loading"></div>
          <p className="mt-3">Loading {status.toLowerCase()} items...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {items.map((item) => (
            <div key={item.id} className="col">
              <div className="card shadow-sm item-card h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title d-flex justify-content-between align-items-center">
                    {item.name} {getStatusBadge(item.status)}
                  </h5>
                  <p className="card-text flex-grow-1">{item.description}</p>
                  <p className="text-muted mb-3">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  {user?.role === 'USER' && status !== 'CLAIMED' && (
                    <button
                      onClick={() => handleRequest(item.id)}
                      className="btn btn-outline-primary mt-auto request-btn"
                    >
                      <FaUserAlt className="me-2" />
                      Request Item
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted fst-italic py-4">
          No {status.toLowerCase()} items found.
        </div>
      )}
    </div>
  );

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-gradient">
        <div className="container">
          <a className="navbar-brand" href="/">
            <FaClipboardList className="me-2" />
            Lost & Found
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white fw-semibold d-flex align-items-center">
              <FaUserAlt className="me-2" />
              {user?.username || 'Guest'}
            </span>
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
              title="Logout"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </nav>

      <main className="container my-5">
        <header className="mb-5 text-center">
          <h1 className="display-4 fw-bold">Dashboard</h1>
          <p className="lead">
            Role: <span className="badge bg-info text-dark">{user?.role || 'N/A'}</span>
          </p>
          <hr className="w-25 mx-auto" />
        </header>

        {renderItemList(lostItems, 'LOST')}
        {renderItemList(foundItems, 'FOUND')}
        {renderItemList(claimedItems, 'CLAIMED')}
      </main>

      <footer className="text-center py-4 text-muted">
        &copy; {new Date().getFullYear()} Lost & Found App. All rights reserved.
      </footer>
    </>
  );
};

export default Dashboard;
