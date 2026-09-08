import { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://pehra-production.up.railway.app/api';
const sessionKey = 'pehra_admin_session';

async function request(path, options = {}, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (session.user?.role !== 'ADMIN')
        throw new Error('This portal is only available to administrators.');
      localStorage.setItem(sessionKey, JSON.stringify(session));
      onLogin(session);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">P</div>
        <p className="kicker">PEHRA ADMIN</p>
        <h1>Keep the whole network in view.</h1>
        <p className="intro">
          Manage accounts, vehicles, and verification activity from one focused
          workspace.
        </p>
        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in to portal'}
          </button>
        </form>
      </section>
      <aside className="login-aside">
        <span>CONTROL ROOM / 01</span>
        <strong>
          Clear records.
          <br />
          Faster decisions.
        </strong>
      </aside>
    </main>
  );
}

const emptyVehicle = {
  customerName: '',
  customerCnic: '',
  vehicleNumber: '',
  chassisNumber: '',
  engineNumber: '',
  make: '',
  model: '',
  year: '',
  color: '',
  status: 'CLEAR',
};

function AccountsPage({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'DEALER',
  });
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function loadUsers() {
    setLoading(true);
    try {
      setUsers(await request('/users', {}, token));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    request('/users', {}, token)
      .then(setUsers)
      .catch(error => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function createUser(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await request(
        '/users',
        {
          method: 'POST',
          body: JSON.stringify({
            ...form,
            email: form.email.trim().toLowerCase(),
          }),
        },
        token,
      );
      setForm({ name: '', email: '', phone: '', password: '', role: 'DEALER' });
      setShowForm(false);
      setMessage('Account created successfully.');
      loadUsers();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleUser(user) {
    try {
      await request(
        `/users/${user._id}/status`,
        { method: 'PATCH', body: JSON.stringify({ isActive: !user.isActive }) },
        token,
      );
      loadUsers();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="kicker">DIRECTORY / 01</p>
          <h2>Accounts</h2>
          <p>Manage the dealer and agent network.</p>
        </div>
        <button
          className="primary-button compact"
          onClick={() => setShowForm(value => !value)}
        >
          {showForm ? 'Close form' : 'Create account'}
        </button>
      </div>
      {message && <p className="inline-message">{message}</p>}
      {showForm && (
        <form className="inline-form account-form" onSubmit={createUser}>
          <h3>New dealer or agent</h3>
          <div className="form-grid">
            <label>
              Full name
              <input
                value={form.name}
                onChange={event =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={event =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={event =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </label>
            <label>
              Initial password
              <input
                type="password"
                minLength="8"
                value={form.password}
                onChange={event =>
                  setForm({ ...form, password: event.target.value })
                }
                required
              />
            </label>
          </div>
          <div className="role-switch">
            <button
              type="button"
              className={form.role === 'DEALER' ? 'selected' : ''}
              onClick={() => setForm({ ...form, role: 'DEALER' })}
            >
              Dealer
            </button>
            <button
              type="button"
              className={form.role === 'AGENT' ? 'selected' : ''}
              onClick={() => setForm({ ...form, role: 'AGENT' })}
            >
              Agent
            </button>
          </div>
          <button className="primary-button compact" disabled={busy}>
            {busy ? 'Creating...' : 'Create account'}
          </button>
        </form>
      )}
      <div className="data-panel">
        <div className="panel-header">
          <h3>Network accounts</h3>
          <span>{users.length} total</span>
        </div>
        {loading ? (
          <p className="empty-state">Loading accounts...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">No dealer or agent accounts yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                      <small>{user.phone || 'No phone provided'}</small>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="role-label">{user.role}</span>
                    </td>
                    <td>
                      <span
                        className={`status-label ${
                          user.isActive ? 'active' : 'inactive'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => toggleUser(user)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function VehicleForm({ token, vehicle, onSaved, onCancel }) {
  const [form, setForm] = useState(vehicle || emptyVehicle);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (key, value) =>
    setForm(current => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : undefined,
      };
      await request(
        vehicle?._id ? `/vehicles/${vehicle._id}` : '/vehicles',
        {
          method: vehicle?._id ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
        token,
      );
      onSaved();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function checkCustomer() {
    if (!form.customerName || !form.customerCnic) return;
    try {
      const result = await request(
        `/vehicles/customer-match?customerName=${encodeURIComponent(
          form.customerName,
        )}&customerCnic=${encodeURIComponent(form.customerCnic)}${
          vehicle?._id ? `&excludeId=${vehicle._id}` : ''
        }`,
        {},
        token,
      );
      if (result.matches?.length)
        setError(
          `Wanted customer record exists for vehicle ${result.matches[0].vehicleNumber}.`,
        );
    } catch (matchError) {
      setError(matchError.message);
    }
  }

  return (
    <form className="inline-form vehicle-form" onSubmit={submit}>
      <div className="page-heading">
        <div>
          <p className="kicker">VEHICLE RECORD</p>
          <h2>{vehicle ? 'Edit vehicle' : 'Add vehicle'}</h2>
        </div>
        <button type="button" className="text-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="form-grid">
        <label>
          Customer name
          <input
            value={form.customerName}
            onChange={event => set('customerName', event.target.value)}
            onBlur={checkCustomer}
            required
          />
        </label>
        <label>
          Customer CNIC
          <input
            value={form.customerCnic}
            onChange={event => set('customerCnic', event.target.value)}
            onBlur={checkCustomer}
            required
          />
        </label>
        <label>
          Vehicle number
          <input
            value={form.vehicleNumber}
            onChange={event =>
              set('vehicleNumber', event.target.value.toUpperCase())
            }
            required
          />
        </label>
        <label>
          Chassis number
          <input
            value={form.chassisNumber}
            onChange={event =>
              set('chassisNumber', event.target.value.toUpperCase())
            }
            required
          />
        </label>
        <label>
          Engine number
          <input
            value={form.engineNumber}
            onChange={event =>
              set('engineNumber', event.target.value.toUpperCase())
            }
            required
          />
        </label>
        <label>
          Make
          <input
            value={form.make}
            onChange={event => set('make', event.target.value)}
          />
        </label>
        <label>
          Model
          <input
            value={form.model}
            onChange={event => set('model', event.target.value)}
          />
        </label>
        <label>
          Year
          <input
            type="number"
            value={form.year}
            onChange={event => set('year', event.target.value)}
          />
        </label>
        <label>
          Color
          <input
            value={form.color}
            onChange={event => set('color', event.target.value)}
          />
        </label>
      </div>
      <div className="role-switch status-switch">
        <button
          type="button"
          className={form.status === 'CLEAR' ? 'selected clear-choice' : ''}
          onClick={() => set('status', 'CLEAR')}
        >
          Clear
        </button>
        <button
          type="button"
          className={form.status === 'WANTED' ? 'selected wanted-choice' : ''}
          onClick={() => set('status', 'WANTED')}
        >
          Wanted
        </button>
      </div>
      <button className="primary-button compact" disabled={busy}>
        {busy ? 'Saving...' : vehicle ? 'Update vehicle' : 'Save vehicle'}
      </button>
    </form>
  );
}

function VehiclesPage({ token }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  async function loadVehicles() {
    setLoading(true);
    try {
      setVehicles(await request('/vehicles', {}, token));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    request('/vehicles', {}, token)
      .then(setVehicles)
      .catch(error => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [token]);
  async function remove(vehicle) {
    if (!window.confirm(`Delete ${vehicle.vehicleNumber}?`)) return;
    try {
      await request(`/vehicles/${vehicle._id}`, { method: 'DELETE' }, token);
      setMessage('Vehicle deleted.');
      loadVehicles();
    } catch (error) {
      setMessage(error.message);
    }
  }
  const visible = vehicles.filter(vehicle =>
    [
      vehicle.vehicleNumber,
      vehicle.customerName,
      vehicle.customerCnic,
      vehicle.make,
      vehicle.model,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  if (editing)
    return (
      <VehicleForm
        token={token}
        vehicle={editing === 'new' ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          setMessage('Vehicle saved.');
          loadVehicles();
        }}
      />
    );
  return (
    <section className="workspace-page">
      <div className="page-heading">
        <div>
          <p className="kicker">REGISTRY / 02</p>
          <h2>Vehicles</h2>
          <p>Review and maintain every vehicle record.</p>
        </div>
        <button
          className="primary-button compact"
          onClick={() => setEditing('new')}
        >
          Add vehicle
        </button>
      </div>
      {message && <p className="inline-message">{message}</p>}
      <div className="data-panel">
        <div className="panel-header">
          <h3>Vehicle registry</h3>
          <input
            className="table-search"
            placeholder="Search records"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        {loading ? (
          <p className="empty-state">Loading vehicles...</p>
        ) : visible.length === 0 ? (
          <p className="empty-state">No matching vehicle records.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map(vehicle => (
                  <tr key={vehicle._id}>
                    <td>
                      <strong>{vehicle.vehicleNumber}</strong>
                      <small>
                        {vehicle.make || 'Make not set'} {vehicle.model || ''}
                      </small>
                    </td>
                    <td>
                      <strong>{vehicle.customerName}</strong>
                      <small>{vehicle.customerCnic}</small>
                    </td>
                    <td>
                      <small>Chassis {vehicle.chassisNumber}</small>
                      <small>Engine {vehicle.engineNumber}</small>
                    </td>
                    <td>
                      <span
                        className={`status-label ${
                          vehicle.status === 'WANTED' ? 'inactive' : 'active'
                        }`}
                      >
                        {vehicle.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="text-button"
                          onClick={() => setEditing(vehicle)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-button danger-button"
                          onClick={() => remove(vehicle)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SearchPage({ token }) {
  const options = [
    ['vehicleNumber', 'Vehicle number'],
    ['chassisNumber', 'Chassis number'],
    ['engineNumber', 'Engine number'],
  ];
  const [field, setField] = useState('vehicleNumber');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(
        await request(
          `/search?field=${field}&value=${encodeURIComponent(value.trim())}`,
          {},
          token,
        ),
      );
    } catch (searchError) {
      if (searchError.message === 'Request failed.') {
        setResult({ found: false, searchedValue: value.trim().toUpperCase() });
      } else {
        setError(searchError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function chooseField(nextField) {
    setField(nextField);
    setValue('');
    setResult(null);
    setError('');
  }

  const vehicle = result?.vehicle;
  return (
    <section className="workspace-page search-page">
      <div className="page-heading">
        <div>
          <p className="kicker">LOOKUP / 03</p>
          <h2>Vehicle search</h2>
          <p>Check a vehicle by its exact registration or identifiers.</p>
        </div>
      </div>
      <form className="search-panel" onSubmit={submit}>
        <p className="search-label">Search by</p>
        <div className="search-options">
          {options.map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={field === key ? 'selected' : ''}
              onClick={() => chooseField(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search-entry">
          <input
            value={value}
            onChange={event => setValue(event.target.value.toUpperCase())}
            placeholder={`Enter ${options
              .find(option => option[0] === field)[1]
              .toLowerCase()}`}
            autoFocus
          />
          <button className="primary-button compact" disabled={loading}>
            {loading ? 'Searching...' : 'Search vehicle'}
          </button>
        </div>
        <p className="search-note">
          A wanted match is recorded by the existing backend search log and
          triggers its dealer alert flow.
        </p>
      </form>
      {error && <p className="form-error search-error">{error}</p>}
      {result &&
        (!result.found ? (
          <div className="result-panel not-found">
            <div className="result-symbol">?</div>
            <div>
              <p className="kicker">NO MATCH</p>
              <h3>No record found</h3>
              <p>
                No vehicle matches <strong>{result.searchedValue}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`result-panel ${
              vehicle.status === 'WANTED' ? 'wanted-result' : 'clear-result'
            }`}
          >
            <div className="result-symbol">
              {vehicle.status === 'WANTED' ? '!' : 'OK'}
            </div>
            <div className="result-content">
              <div className="result-heading">
                <div>
                  <p className="kicker">MATCH FOUND</p>
                  <h3>{vehicle.vehicleNumber}</h3>
                </div>
                <span
                  className={`status-label ${
                    vehicle.status === 'WANTED' ? 'inactive' : 'active'
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>
              <div className="result-details">
                <span>
                  <small>Chassis</small>
                  {vehicle.chassisNumber}
                </span>
                <span>
                  <small>Engine</small>
                  {vehicle.engineNumber}
                </span>
                <span>
                  <small>Make / model</small>
                  {`${vehicle.make || '-'} ${vehicle.model || ''}`.trim()}
                </span>
                <span>
                  <small>Dealer</small>
                  {vehicle.dealer?.name || '-'}
                </span>
              </div>
              {vehicle.status === 'WANTED' && (
                <p className="result-alert">
                  Dealer alert was created automatically.
                </p>
              )}
            </div>
          </div>
        ))}
    </section>
  );
}

function Dashboard({ session, onLogout }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview');

  useEffect(() => {
    request('/admin/stats', {}, session.token)
      .then(setStats)
      .catch(statsError => setError(statsError.message));
  }, [session.token]);

  const cards = [
    ['Dealers', stats?.dealers, 'Registered partners'],
    ['Agents', stats?.agents, 'Active field access'],
    ['Vehicles', stats?.vehicles, 'Records in registry'],
    ['Wanted', stats?.wanted, 'Need attention'],
  ];

  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark small">P</span>
          <span>Pehra</span>
        </div>
        <p className="nav-label">Workspace</p>
        <button
          className={`nav-item ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          <span className="nav-dot" />
          Overview
        </button>
        <button
          className={`nav-item ${view === 'accounts' ? 'active' : ''}`}
          onClick={() => setView('accounts')}
        >
          Accounts
        </button>
        <button
          className={`nav-item ${view === 'vehicles' ? 'active' : ''}`}
          onClick={() => setView('vehicles')}
        >
          Vehicles
        </button>
        <button
          className={`nav-item ${view === 'search' ? 'active' : ''}`}
          onClick={() => setView('search')}
        >
          Search
        </button>
        <div className="sidebar-footer">
          <p>{session.user.name}</p>
          <span>{session.user.email}</span>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="kicker">WEDNESDAY, SEPTEMBER 09</p>
            <h1>Good morning, {session.user.name.split(' ')[0]}.</h1>
          </div>
          <div className="avatar">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
        </header>
        {view === 'accounts' ? (
          <AccountsPage token={session.token} />
        ) : view === 'vehicles' ? (
          <VehiclesPage token={session.token} />
        ) : view === 'search' ? (
          <SearchPage token={session.token} />
        ) : (
          <>
            <section className="welcome-band">
              <div>
                <p className="kicker">LIVE OPERATIONS</p>
                <h2>
                  Everything important,
                  <br />
                  <em>in one glance.</em>
                </h2>
              </div>
              <span className="band-number">01</span>
            </section>
            {error && <p className="form-error dashboard-error">{error}</p>}
            <section className="stat-grid">
              {cards.map(([label, value, description]) => (
                <article className="stat-card" key={label}>
                  <p>{label}</p>
                  <strong>{value ?? '--'}</strong>
                  <span>{description}</span>
                </article>
              ))}
            </section>
            <section className="next-panel">
              <div>
                <p className="kicker">ADMIN TOOLKIT</p>
                <h2>Your workspace is ready.</h2>
                <p>
                  Account management, vehicle records, and search tools will
                  live here.
                </p>
              </div>
              <span className="pulse" />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() =>
    JSON.parse(localStorage.getItem(sessionKey) || 'null'),
  );
  function logout() {
    localStorage.removeItem(sessionKey);
    setSession(null);
  }
  return session?.user?.role === 'ADMIN' ? (
    <Dashboard session={session} onLogout={logout} />
  ) : (
    <Login onLogin={setSession} />
  );
}
