// src/App.tsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createFilter } from 'react-search-input';
import { shuffle } from './util/shuffle';
import Search from './components/Search';
import BatchCards from './components/BatchCards';
import Navbar from './components/Navbar';
import { pageNames } from './util/pageNames';
import useForceUpdate from './util/useForceUpdate';
import persons from './assets/persons.json';
import Landing from './components/Landing';
import Login from './components/Login';
import Register from './components/Register';
import ProfileForm from './components/ProfileForm';
import AdminPage from './components/Admin';

const SimpleMap = lazy(() => import('./components/Map'));

const style: React.CSSProperties = {
  background: '#fff',
  padding: '1rem',
  width: '100%',
  margin: '0 0 2rem 0',
  zIndex: 1,
  borderRadius: '5px',
};

const responsiveSearch = {
  width: '100%',
  marginBottom: '0.5rem',
  padding: '0.5rem',
};

const KEYS_TO_FILTERS = [
  'name',
  'jobTitle',
  'location.city',
  'location.state',
  'location.country',
];

type Role = 'student' | 'recruiter' | 'admin';
type StoredUser = { _id: string; email: string; fullName?: string; role: Role; profileCompleted?: boolean };

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}
function setStoredUser(u: StoredUser | null) {
  try {
    if (!u) localStorage.removeItem('user');
    else localStorage.setItem('user', JSON.stringify(u));
  } catch {}
}

function App() {
  /**
   * Step flow:
   * 0 → Landing
   * 1 → Login / Register
   * 2 → Profile Form (students only, first time)
   * 3 → Main Page
   */
  const [step, setStep] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const [searchfield, setSearchfield] = useState('');
  const [map, setMap] = useState(false);
  const [mapOrHomeTitle, setMapOrHomeTitle] = useState(pageNames.map);

  // Profiles state: persons.json + any locally-created profiles
  const [profiles, setProfiles] = useState<any[]>(() => {
    const seed = (persons as any[]) || [];
    try {
      const saved = JSON.parse(localStorage.getItem('userProfiles') || '[]');
      return [...saved, ...seed];
    } catch {
      return seed;
    }
  });

  // Admin view flag (frontend)
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isAdmin') === 'true';
    } catch {
      return false;
    }
  });

  const forceUpdate = useForceUpdate();

  // optional: idle prefetch map
  useEffect(() => {
    const preload = () => import('./components/Map').catch(() => {});
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload, { timeout: 2000 });
    } else {
      const t = setTimeout(preload, 1500);
      return () => clearTimeout(t);
    }
  }, []);

  // If user already logged in, resume flow
  useEffect(() => {
    const u = getStoredUser();
    if (!u) return;
    if (u.role === 'admin') {
      localStorage.setItem('isAdmin', 'true');
      setIsAdminView(true);
      return;
    }
    if (u.role === 'student' && !u.profileCompleted) {
      setStep(2);
    } else {
      setStep(3);
    }
  }, []);

  const filteredForDisplay = (searchFilter: string) => {
    try {
      return profiles.filter(createFilter(searchFilter, KEYS_TO_FILTERS));
    } catch {
      const q = (searchFilter || '').toLowerCase();
      return profiles.filter((p: any) =>
        (`${p.name || ''} ${p.jobTitle || ''} ${JSON.stringify(p.location || {})}`).toLowerCase().includes(q)
      );
    }
  };

  function goBack() {
    setMap(!map);
    setMapOrHomeTitle(map ? pageNames.map : pageNames.home);
    setSearchfield('');
  }

  function shufflePeopleOnClick() {
    shuffle(profiles);
    forceUpdate();
  }

  // 👉 Sign out handler
  function handleSignOut() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('admin_token');
      // keep userProfiles if you want them visible after logout; remove next line if you want to keep
      // localStorage.removeItem('userProfiles');
    } catch {}
    setIsAdminView(false);
    setStep(0); // back to Landing
    setShowRegister(false);
    setMap(false);
    setMapOrHomeTitle(pageNames.map);
    setSearchfield('');
  }

  // ---------- FLOW HANDLING ----------
  if (isAdminView) {
    return <AdminPage />;
  }

  if (step === 0) {
    return (
      <Landing
        onContinue={() => setStep(1)}
        onLogin={() => setStep(1)}
        onRegister={() => { setShowRegister(true); setStep(1); }}
        onHire={() => setStep(3)} // recruiters preview
      />
    );
  }

  if (step === 1) {
    const handleLogin = (isAdmin?: boolean) => {
      if (isAdmin) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('admin_token', 'local-demo-token');
        setIsAdminView(true);
        return;
      }
      const u = getStoredUser();
      if (u?.role === 'student' && !u.profileCompleted) {
        setStep(2);
      } else {
        setStep(3);
      }
    };

    const handleRegister = (role: Role, profileCompleted?: boolean) => {
      if (role === 'student' && !profileCompleted) {
        setStep(2);
      } else {
        setStep(3);
      }
    };

    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onToggleLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onToggleRegister={() => setShowRegister(true)}
      />
    );
  }

  // Profile step (students only, first time)
  if (step === 2) {
    return (
      <ProfileForm
        onSubmit={(profile) => {
          // Save profile to localStorage list (for display)
          try {
            const prev = JSON.parse(localStorage.getItem('userProfiles') || '[]');
            const next = [profile, ...prev];
            localStorage.setItem('userProfiles', JSON.stringify(next));
          } catch {}

          // Mark profileCompleted on the stored user so next login skips this step
          const u = getStoredUser();
          if (u) {
            const updated = { ...u, profileCompleted: true };
            setStoredUser(updated);
          }

          // Update UI immediately
          setProfiles((prev) => [profile, ...prev]);

          // Proceed to main
          setStep(3);
        }}
      />
    );
  }

  // ---------- MAIN PAGE ----------
  return (
    <div className="flex flex-column min-vh-100 tc">
      <header
        className="custom--unselectable top-0 w-100 white custom--bg-additional3 custom--shadow-4 z-9999"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Navbar
          onLogoClick={goBack}
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchfield(e.target.value)
          }
          onMapClick={goBack}
          mapOrHomeTitle={mapOrHomeTitle}
          shufflePeopleOnClick={shufflePeopleOnClick}
        />
        <button
          onClick={handleSignOut}
          style={{
            background: '#2296f3',
            color: '#fff',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(34,150,243,0.35)',
            marginRight: '1rem',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1764c0')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2296f3')}
          aria-label="Sign out"
          title="Sign out"
        >
          Sign Out
        </button>
      </header>

      <main className="flex-auto">
        {map ? (
          <Suspense
            fallback={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '60vh',
                }}
              >
                <div className="spinner" />
                <style>
                  {`
                    .spinner {
                      border: 6px solid #f3f3f3;
                      border-top: 6px solid #2296f3;
                      border-radius: 50%;
                      width: 40px;
                      height: 40px;
                      animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}
                </style>
              </div>
            }
          >
            <SimpleMap />
          </Suspense>
        ) : (
          <div id="sketch-particles">
            <div className="visible-on-mobileview-only" style={style}>
              <Search
                onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchfield(e.target.value)
                }
                responsiveSearch={responsiveSearch}
              />
            </div>
            <BatchCards persons={filteredForDisplay(searchfield)} numberPerBatch={16} />
          </div>
        )}
      </main>

      <footer className="custom--unselectable w-100 h3 flex items-center justify-center white custom--bg-additional3 z-2">
        <div className="flex items-center">
          Copyright © {new Date().getFullYear()} by Zero to Mastery.
          All Rights Reserved. &nbsp;&nbsp;
          <a
            href="https://github.com/zero-to-mastery/ZtM-Job-Board"
            title="Repository"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </footer>

      <div className="custom--top-button">
        <div
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-arrow-up"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default App;
