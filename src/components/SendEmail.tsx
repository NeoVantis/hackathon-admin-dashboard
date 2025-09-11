import React, { useState } from 'react';

const SEND_EMAIL_API_URL = import.meta.env.VITE_NOTIFICATION_SEND_EMAIL_API_URL;
const SEND_BULK_EMAIL_API_URL = import.meta.env.VITE_NOTIFICATION_SEND_BULK_EMAIL_API_URL;

const defaultSingle = {
  recipientEmail: '',
  recipientName: '',
  subject: '',
  content: '',
  htmlContent: '',
  priority: 'normal',
  scheduledAt: '',
  metadata: '',
  campaignId: '',
};

const defaultBulk = {
  recipientEmails: '', // comma or newline separated
  subject: '',
  content: '',
  htmlContent: '',
  priority: 'normal',
  scheduledAt: '',
  metadata: '',
  campaignId: '',
};

export default function SendEmail() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [single, setSingle] = useState(defaultSingle);
  const [bulk, setBulk] = useState(defaultBulk);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);


  type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  const handleChange = (e: InputChangeEvent, isBulk = false) => {
    const { name, value } = e.target;
    if (isBulk) setBulk((b) => ({ ...b, [name]: value }));
    else setSingle((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      let url = '';
      let body: Record<string, unknown> = {};
      if (mode === 'single') {
        url = SEND_EMAIL_API_URL;
        body = {
          ...single,
          metadata: single.metadata ? JSON.parse(single.metadata) : undefined,
          scheduledAt: single.scheduledAt || undefined,
        };
        if (!body.htmlContent) delete body.htmlContent;
        if (!body.recipientName) delete body.recipientName;
        if (!body.metadata) delete body.metadata;
        if (!body.scheduledAt) delete body.scheduledAt;
        if (!body.campaignId) delete body.campaignId;
      } else {
        url = SEND_BULK_EMAIL_API_URL;
        body = {
          ...bulk,
          recipientEmails: bulk.recipientEmails
            .split(/[\n,]+/)
            .map((e) => e.trim())
            .filter(Boolean),
          metadata: bulk.metadata ? JSON.parse(bulk.metadata) : undefined,
          scheduledAt: bulk.scheduledAt || undefined,
        };
        if (!body.htmlContent) delete body.htmlContent;
        if (!body.metadata) delete body.metadata;
        if (!body.scheduledAt) delete body.scheduledAt;
        if (!body.campaignId) delete body.campaignId;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setResult({ success: false, message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      margin: '32px 32px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '32px'
    }}>
      <h2 style={{ marginBottom: '24px', color: '#333', textAlign: 'center' }}>Send Email Notification</h2>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px',
        padding: '8px',
        background: '#f8f9fa',
        borderRadius: '20px',
        border: '1px solid #e9ecef'
      }}>
        <button
          onClick={() => setMode('single')}
          disabled={mode === 'single'}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: mode === 'single' ? '#007bff' : 'transparent',
            color: mode === 'single' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Single Email
        </button>
        <button
          onClick={() => setMode('bulk')}
          disabled={mode === 'bulk'}
          style={{
            flex: 1,
            padding: '8px 16px',
            background: mode === 'bulk' ? '#007bff' : 'transparent',
            color: mode === 'bulk' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          Bulk Email
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'single' ? (
          <>
            {/* Recipient Details */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>Recipient Details</h3>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Recipient Email <span style={{ color: '#dc3545' }}>*</span>
                <input
                  name="recipientEmail"
                  value={single.recipientEmail}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Recipient Name
                <input
                  name="recipientName"
                  value={single.recipientName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
            </div>

            {/* Email Content */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>Email Content</h3>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Subject <span style={{ color: '#dc3545' }}>*</span>
                <input
                  name="subject"
                  value={single.subject}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Plain Text Body <span style={{ color: '#dc3545' }}>*</span>
                <textarea
                  name="content"
                  value={single.content}
                  onChange={handleChange}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                HTML Body
                <textarea
                  name="htmlContent"
                  value={single.htmlContent}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </label>
            </div>

            {/* Settings */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>Settings</h3>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Priority
                <select
                  name="priority"
                  value={single.priority}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Scheduled At (ISO 8601)
                <input
                  name="scheduledAt"
                  value={single.scheduledAt}
                  onChange={handleChange}
                  placeholder="2025-09-08T10:15:00.000Z"
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Metadata (JSON)
                <input
                  name="metadata"
                  value={single.metadata}
                  onChange={handleChange}
                  placeholder='{"source":"signup"}'
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Campaign ID
                <input
                  name="campaignId"
                  value={single.campaignId}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            {/* Recipient Details */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>Recipient Details</h3>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Recipient Emails <span style={{ color: '#dc3545' }}>*</span> (comma or newline separated, max 1000)
                <textarea
                  name="recipientEmails"
                  value={bulk.recipientEmails}
                  onChange={(e) => handleChange(e, true)}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </label>
            </div>

            {/* Email Content */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>Email Content</h3>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Subject <span style={{ color: '#dc3545' }}>*</span>
                <input
                  name="subject"
                  value={bulk.subject}
                  onChange={(e) => handleChange(e, true)}
                  required
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Plain Text Body <span style={{ color: '#dc3545' }}>*</span>
                <textarea
                  name="content"
                  value={bulk.content}
                  onChange={(e) => handleChange(e, true)}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                HTML Body
                <textarea
                  name="htmlContent"
                  value={bulk.htmlContent}
                  onChange={(e) => handleChange(e, true)}
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
              </label>
            </div>

            {/* Settings */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#555', fontSize: '1.1rem', borderBottom: '1px solid #e9ecef', paddingBottom: '8px' }}>Settings</h3>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Priority
                <select
                  name="priority"
                  value={bulk.priority}
                  onChange={(e) => handleChange(e, true)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Scheduled At (ISO 8601)
                <input
                  name="scheduledAt"
                  value={bulk.scheduledAt}
                  onChange={(e) => handleChange(e, true)}
                  placeholder="2025-09-08T10:30:00.000Z"
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Metadata (JSON)
                <input
                  name="metadata"
                  value={bulk.metadata}
                  onChange={(e) => handleChange(e, true)}
                  placeholder='{"batch":1}'
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
              <label style={{ display: 'block', marginBottom: '16px', fontWeight: '500', color: '#555', fontSize: '0.9rem' }}>
                Campaign ID
                <input
                  name="campaignId"
                  value={bulk.campaignId}
                  onChange={(e) => handleChange(e, true)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </label>
            </div>
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => {
              setSingle(defaultSingle);
              setBulk(defaultBulk);
              setResult(null);
            }}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#6c757d',
              border: '1px solid #6c757d',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#6c757d' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Sending...' : mode === 'single' ? 'Send Email' : 'Send Bulk Email'}
          </button>
        </div>
      </form>

      {result && (
        <div style={{
          marginTop: '24px',
          padding: '12px',
          borderRadius: '6px',
          background: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          textAlign: 'center'
        }}>
          {result.message}
        </div>
      )}
    </div>
  );
}
