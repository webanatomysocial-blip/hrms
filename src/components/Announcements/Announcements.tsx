import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Megaphone, Plus, Trash2, Calendar, User } from 'lucide-react';

const Announcements: React.FC = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.getAnnouncements();
      if (res.success) setAnnouncements(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSubmitting(true);
    try {
      const res = await api.createAnnouncement({ title, content });
      if (res.success) {
        setTitle('');
        setContent('');
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await api.deleteAnnouncement(id);
      if (res.success) {
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container-fluid fade-in px-0 py-4">
      <div className="row mb-5">
        <div className="col-12">
          <h1 className="display-6 fw-800 text-white mb-2 d-flex align-items-center">
            <Megaphone className="text-cyan me-3" size={32} /> Company Announcements
          </h1>
          <p className="text-secondary fw-600">Stay updated with the latest news, notices, and insights across the company.</p>
        </div>
      </div>

      <div className="row g-4">
        {isAdmin && (
          <div className="col-lg-4 col-12">
            <div className="premium-card p-4" style={{ 
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
              <h5 className="text-white fw-800 mb-4 d-flex align-items-center">
                <Plus className="me-2 text-cyan" size={22} /> Broadcast Notice
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" style={{ letterSpacing: '0.5px' }}>Title</label>
                  <input 
                    type="text" 
                    className="form-control text-white" 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Office schedule update" 
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="text-secondary small fw-700 text-uppercase mb-2 d-block" style={{ letterSpacing: '0.5px' }}>Message Content</label>
                  <textarea 
                    className="form-control text-white" 
                    rows={6}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="Type details of your notification here..." 
                    required
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn btn-premium-cyan w-100 py-3 fw-800 shadow-glow-cyan" style={{ borderRadius: '12px' }}>
                  {isSubmitting ? 'Posting...' : 'Publish Announcement'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className={isAdmin ? 'col-lg-8 col-12' : 'col-12'}>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-cyan" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-5 premium-card" style={{ 
              background: 'rgba(255, 255, 255, 0.01)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255,255,255,0.03)',
              padding: '60px'
            }}>
              <Megaphone size={48} className="text-dimmed opacity-20 mb-3" />
              <h5 className="text-white fw-700">No Announcements found</h5>
              <p className="text-secondary small">Important news broadcasts will be listed here.</p>
            </div>
          ) : (
            <div className="row g-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="col-12">
                  <div className="premium-card p-4 position-relative" style={{ 
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                  }}>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(ann.id)} 
                        className="btn btn-sm btn-danger position-absolute" 
                        style={{ top: '20px', right: '20px', borderRadius: '10px' }}
                        title="Delete Announcement"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <h4 className="text-white fw-800 mb-2">{ann.title}</h4>
                    <div className="d-flex align-items-center gap-3 mb-3 text-secondary small fw-600">
                      <span className="d-flex align-items-center gap-1">
                        <User size={14} className="text-cyan" /> {ann.author_name || 'Admin'}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Calendar size={14} className="text-cyan" /> {new Date(ann.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-light fw-500 mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                      {ann.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
