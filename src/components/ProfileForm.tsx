// src/components/ProfileForm.tsx
import React, { useMemo, useState } from 'react';

type ProfileFormProps = {
  onSubmit: (profile: any) => void; // returns the normalized profile object
};

const countries = ['Nigeria', 'India', 'Australia', 'Canada', 'USA', 'UK', 'Sri Lanka'] as const;
type Country = typeof countries[number];

const states: Record<Country, string[]> = {
  Nigeria: ['Fct', 'Lagos', 'Kano'],
  India: ['Maharashtra', 'Telangana', 'Karnataka'],
  Australia: ['NSW', 'VIC', 'QLD'],
  Canada: ['Ontario', 'Quebec'],
  USA: ['California', 'New York'],
  UK: ['England', 'Scotland'],
  'Sri Lanka': ['Western', 'Central'],
};

const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    img: '',
    email: '',
    website: '',
    linkedin: '',
    github: '',
    jobTitle: '',
    city: '',
    state: '',
    country: '' as '' | Country,
  });
  const [step, setStep] = useState<'edit' | 'review'>('edit');

  const isValid = useMemo(() => {
    const { name, img, email, jobTitle, city, state, country } = formData;
    if (!name.trim() || !img.trim() || !email.trim() || !jobTitle.trim() || !city.trim()) return false;
    if (!country || !state) return false;
    if (!email.includes('@')) return false;
    try { new URL(img); } catch { return false; }
    return true;
  }, [formData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function toProfile() {
    // Normalize to JobBoard schema (like persons.json)
    return {
      id: String(Date.now()), // demo id
      name: formData.name.trim(),
      img: formData.img.trim(),
      email: formData.email.trim(),
      links: {
        website: formData.website.trim(),
        linkedin: formData.linkedin.trim(),
        github: formData.github.trim(),
      },
      jobTitle: formData.jobTitle.trim(),
      location: {
        city: formData.city.trim(),
        state: formData.state,
        country: formData.country,
      },
      status: 'approved', // or 'pending' if you add moderation later
    };
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      alert('Please complete required fields correctly.');
      return;
    }
    setStep('review');
  }

  function handleConfirm() {
    const profile = toProfile();
    onSubmit(profile);
  }

  return (
    <>
      <style>{`
       .form-container {
  max-width: 720px;
  margin: 2.5rem auto;
  padding: 2.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 14px 34px rgba(34, 150, 243, 0.22);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #0a2a43;
}

.form-container h2 {
  text-align: center;
  margin-bottom: 1.8rem;
  font-weight: 900;
  color: #2296f3;
  letter-spacing: 0.3px;
}

/* Label styling */
form > label {
  display: block;
  margin: 0.6rem 0 0.35rem;
  font-weight: 700;
  color: #1764c0;
  font-size: 1rem;
}

/* Inputs and Selects */
input, select {
  width: 100%;
  padding: 1rem 1.1rem; /* increased height */
  border: 2px solid #2296f3;
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.5; /* prevents g/y clipping */
  color: #0a2a43;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  margin-bottom: 1.3rem; /* increased spacing between inputs */
  background: #fff;
  box-sizing: border-box;
}

/* Focus styles */
input:focus, select:focus {
  border-color: #1764c0;
  box-shadow: 0 0 0 4px rgba(23,100,192,0.15);
}

/* Rows of two inputs */
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px; /* more comfortable gap */
  margin-bottom: 0.8rem;
}

/* Buttons */
.actions {
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 1rem 1.4rem;
  border-radius: 40px;
  border: none;
  font-weight: 900;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-primary {
  background: #2296f3;
  color: #fff;
  box-shadow: 0 10px 24px rgba(34,150,243,0.35);
}

.btn-primary:hover {
  transform: translateY(-1px);
  background: #1764c0;
  box-shadow: 0 12px 28px rgba(23,100,192,0.45);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-ghost {
  background: transparent;
  color: #1764c0;
  border: 1px solid rgba(23,100,192,0.25);
}

/* Review card */
.review-card {
  background: #f5faff;
  border: 1px solid #d9ecff;
  border-radius: 12px;
  padding: 20px;
  color: #0b3c91;
  margin-top: 1rem;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  line-height: 1.6;
}

@media (max-width: 700px) {
  .row, .review-grid {
    grid-template-columns: 1fr;
  }
}

      `}</style>

      <section className="form-container" role="main" aria-label="User profile entry form">
        {step === 'edit' && (
          <>
            <h2>Create Your Profile</h2>
            <form onSubmit={handleNext} noValidate>
              <div className="row">
                <div>
                  <label htmlFor="name">Full Name *</label>
                  <input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="jobTitle">Job Title *</label>
                  <input id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} required />
                </div>
              </div>

              <div className="row">
                <div>
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="img">Profile Image URL *</label>
                  <input id="img" name="img" type="url" value={formData.img} onChange={handleChange} required />
                </div>
              </div>

              <div className="row">
                <div>
                  <label htmlFor="city">City *</label>
                  <input id="city" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div>
                  <label htmlFor="country">Country *</label>
                  <select id="country" name="country" value={formData.country} onChange={handleChange} required>
                    <option value="">Select Country</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="row">
                <div>
                  <label htmlFor="state">State/Province *</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    disabled={!formData.country}
                  >
                    <option value="">Select State/Province</option>
                    {(formData.country ? states[formData.country as Country] : []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="url" value={formData.website} onChange={handleChange} />
                </div>
              </div>

              <div className="row">
                <div>
                  <label htmlFor="linkedin">LinkedIn URL</label>
                  <input id="linkedin" name="linkedin" type="url" value={formData.linkedin} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="github">GitHub URL</label>
                  <input id="github" name="github" type="url" value={formData.github} onChange={handleChange} />
                </div>
              </div>

              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={!isValid}>Review</button>
              </div>
            </form>
          </>
        )}

        {step === 'review' && (
          <>
            <h2>Review Your Details</h2>
            <div className="review-card">
              <div className="review-grid">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Job Title:</strong> {formData.jobTitle}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Image URL:</strong> {formData.img}</div>
                <div><strong>City:</strong> {formData.city}</div>
                <div><strong>State:</strong> {formData.state}</div>
                <div><strong>Country:</strong> {formData.country}</div>
                <div><strong>Website:</strong> {formData.website || '—'}</div>
                <div><strong>LinkedIn:</strong> {formData.linkedin || '—'}</div>
                <div><strong>GitHub:</strong> {formData.github || '—'}</div>
              </div>
            </div>

            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btn btn-ghost" onClick={() => setStep('edit')}>Back</button>
              <button className="btn btn-primary" onClick={handleConfirm}>Submit</button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default ProfileForm;
