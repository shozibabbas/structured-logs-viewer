'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    enablePackets: true,
    packetStartPattern: '',
    packetEndPattern: '',
    packetIdPattern: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.settings) {
        setFormData({
          enablePackets: data.settings.enablePackets,
          packetStartPattern: data.settings.packetStartPattern,
          packetEndPattern: data.settings.packetEndPattern,
          packetIdPattern: data.settings.packetIdPattern,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      enablePackets: true,
      packetStartPattern: 'Received message on',
      packetEndPattern: 'Processed OK',
      packetIdPattern: 'job_id=([a-zA-Z0-9_-]+)',
    });
    setMessage({ type: 'success', text: 'Reset to default values' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
            <p className="text-gray-600">Configure log parsing and packet tracking</p>
          </div>
          <Link
            href="/logs"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Logs
          </Link>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Packet Tracking Toggle */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Message Packet Tracking</h2>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enablePackets"
                checked={formData.enablePackets}
                onChange={(e) => setFormData({ ...formData, enablePackets: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="enablePackets" className="text-gray-700 font-medium">
                Enable message packet tracking
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500 ml-8">
              Group related log entries into packets based on start and end patterns
            </p>
          </div>

          {/* Packet Patterns */}
          <div className={`space-y-6 ${!formData.enablePackets ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-semibold text-gray-900">Packet Detection Patterns</h2>

            {/* Start Pattern */}
            <div>
              <label htmlFor="packetStartPattern" className="block text-sm font-medium text-gray-700 mb-2">
                Packet Start Pattern (Regex)
              </label>
              <input
                type="text"
                id="packetStartPattern"
                value={formData.packetStartPattern}
                onChange={(e) => setFormData({ ...formData, packetStartPattern: e.target.value })}
                placeholder="e.g., Received message on"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={!formData.enablePackets}
              />
              <p className="mt-1 text-xs text-gray-500">
                Regular expression to match the start of a message packet
              </p>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900 font-semibold mb-1">Example:</p>
                <code className="text-xs text-blue-800">
                  2026-01-30 04:31:32,967 | INFO | message_queue_listener | <span className="bg-yellow-200">Received message on</span> data.pipeline.input.document_processing
                </code>
              </div>
            </div>

            {/* End Pattern */}
            <div>
              <label htmlFor="packetEndPattern" className="block text-sm font-medium text-gray-700 mb-2">
                Packet End Pattern (Regex)
              </label>
              <input
                type="text"
                id="packetEndPattern"
                value={formData.packetEndPattern}
                onChange={(e) => setFormData({ ...formData, packetEndPattern: e.target.value })}
                placeholder="e.g., Processed OK"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={!formData.enablePackets}
              />
              <p className="mt-1 text-xs text-gray-500">
                Regular expression to match the end of a message packet
              </p>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900 font-semibold mb-1">Example:</p>
                <code className="text-xs text-blue-800">
                  2026-01-30 04:31:56,692 | INFO | message_queue_listener | <span className="bg-yellow-200">Processed OK</span>
                </code>
              </div>
            </div>

            {/* Packet ID Pattern */}
            <div>
              <label htmlFor="packetIdPattern" className="block text-sm font-medium text-gray-700 mb-2">
                Packet ID Pattern (Regex)
              </label>
              <input
                type="text"
                id="packetIdPattern"
                value={formData.packetIdPattern}
                onChange={(e) => setFormData({ ...formData, packetIdPattern: e.target.value })}
                placeholder="e.g., job_id=([a-zA-Z0-9_-]+)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                disabled={!formData.enablePackets}
              />
              <p className="mt-1 text-xs text-gray-500">
                Regular expression to extract packet ID from log messages
              </p>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900 font-semibold mb-1">Example:</p>
                <code className="text-xs text-blue-800">
                  2026-01-30 05:44:17,678 | INFO | mq_listener_document_checklist_mapping | ACKing message early for <span className="bg-yellow-200">job_id=d6e2b075cbad47419e381e74d60e3743</span>
                </code>
              </div>
            </div>

            {/* Regex Help */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Regex Quick Reference</h3>
              <ul className="text-xs text-gray-700 space-y-1">
                <li><code className="bg-gray-200 px-1 rounded">.*</code> - Match any characters</li>
                <li><code className="bg-gray-200 px-1 rounded">^</code> - Start of string</li>
                <li><code className="bg-gray-200 px-1 rounded">$</code> - End of string</li>
                <li><code className="bg-gray-200 px-1 rounded">\d+</code> - One or more digits</li>
                <li><code className="bg-gray-200 px-1 rounded">\w+</code> - One or more word characters</li>
                <li><code className="bg-gray-200 px-1 rounded">(pattern1|pattern2)</code> - Match either pattern</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset to Default
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How Packet Tracking Works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>When enabled, logs are grouped into packets based on your patterns</li>
            <li>Each packet gets a unique ID based on its start timestamp</li>
            <li>You can filter logs by packet ID in the viewer</li>
            <li>Packets help track complete workflows or request lifecycles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
