'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, Select, Button, Input, Tag, Spin, Alert, List, Badge, message } from 'antd';
import { 
  Scan, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Download, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Database,
  ArrowRight,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchEventActivities, scanTicket, EventActivity } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

// =========================================================================
// Cryptographic Helpers (Web Crypto API - AES-GCM 256-bit Encryption)
// =========================================================================

// Generate ephemeral key kept purely in-memory
async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt payload returning ArrayBuffer & IV
async function encryptData(key: CryptoKey, dataStr: string): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(dataStr)
  );
  return { ciphertext, iv };
}

// Decrypt payload back to string
async function decryptData(key: CryptoKey, ciphertext: ArrayBuffer, iv: BufferSource): Promise<string> {
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// =========================================================================
// IndexedDB Local Store Management
// =========================================================================

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RongPlanOfflineStore', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('attendees')) {
        db.createObjectStore('attendees', { keyPath: 'eventId' });
      }
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export default function QRScannerPage() {
  const { user } = useAuth();
  
  // App states
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventSlug, setSelectedEventSlug] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  // Activities states
  const [activities, setActivities] = useState<EventActivity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  
  // Offline / Online engine states
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [forceOffline, setForceOffline] = useState<boolean>(false);
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Data caches
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [pendingSyncs, setPendingSyncs] = useState<any[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  
  // Inputs
  const [manualToken, setManualToken] = useState<string>('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    alreadyCheckedIn?: boolean;
    message: string;
    participant?: {
      email: string;
      userId: string;
      eventTitle: string;
    };
  } | null>(null);

  // In-memory Ephemeral Key
  const encryptionKeyRef = useRef<CryptoKey | null>(null);

  // Connection monitoring
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      message.success('Internet connection restored.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      message.warning('Internet connection lost. Switched to offline mode.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial database & key setup
    const init = async () => {
      try {
        if (!encryptionKeyRef.current) {
          encryptionKeyRef.current = await generateEncryptionKey();
        }
        await openDatabase();
        await refreshPendingSyncCount();
      } catch (err: any) {
        console.error('Failed to initialize local IndexedDB / WebCrypto:', err);
      }
    };
    init();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/v1/events');
        if (res.ok) {
          const data = await res.json();
          // Filter events hosted by this user
          const hostEvents = data.filter((e: any) => e.host_username === user?.username);
          setEvents(hostEvents);
          if (hostEvents.length > 0) {
            setSelectedEventSlug(hostEvents[0].slug);
            setSelectedEventId(hostEvents[0].id);
          }
        }
      } catch (err) {
        message.error('Failed to fetch events from server.');
      }
    }
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Sync count refresher
  const refreshPendingSyncCount = async () => {
    try {
      const db = await openDatabase();
      const transaction = db.transaction('pending_sync', 'readonly');
      const store = transaction.objectStore('pending_sync');
      const allRequest = store.getAll();
      
      allRequest.onsuccess = () => {
        setPendingSyncs(allRequest.result);
      };
    } catch (err) {
      console.warn('Failed to load pending offline syncs:', err);
    }
  };

  // Change selected event
  const handleEventChange = (slug: string) => {
    setSelectedEventSlug(slug);
    const ev = events.find(e => e.slug === slug);
    if (ev) {
      setSelectedEventId(ev.id);
      // Reset local cache stats for new selection
      checkOfflineCacheStatus(ev.id);
    }
  };

  // Check if selected event has offline cache
  const checkOfflineCacheStatus = async (eventId: number) => {
    try {
      const db = await openDatabase();
      const tx = db.transaction('attendees', 'readonly');
      const store = tx.objectStore('attendees');
      const req = store.get(eventId);
      
      req.onsuccess = async () => {
        if (req.result && encryptionKeyRef.current) {
          try {
            const { ciphertext, iv } = req.result;
            const decryptedJson = await decryptData(encryptionKeyRef.current, ciphertext, iv);
            const list = JSON.parse(decryptedJson);
            setCachedCount(list.length);
          } catch {
            // Ephemeral key mismatch (page refreshed/new key)
            setCachedCount(0);
          }
        } else {
          setCachedCount(0);
        }
      };
    } catch {
      setCachedCount(0);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      checkOfflineCacheStatus(selectedEventId);
    }
  }, [selectedEventId]);

  // Load activities when event changes
  useEffect(() => {
    async function loadActivities() {
      if (!selectedEventSlug) return;
      try {
        const acts = await fetchEventActivities(selectedEventSlug);
        setActivities(acts);
        if (acts.length > 0) {
          setSelectedActivityId(acts[0].id);
        } else {
          setSelectedActivityId(null);
        }
      } catch (err) {
        console.warn('Failed to load event activities, falling back to default Check-in', err);
        setActivities([{ id: 0, name: 'Check-in', event_id: selectedEventId || 0, scan_limit: 1, is_active: true, sort_order: 0, created_at: '' }]);
        setSelectedActivityId(0);
      }
    }
    loadActivities();
  }, [selectedEventSlug, selectedEventId]);

  // Download & Encrypt Attendee list locally
  const downloadAttendeesOffline = async () => {
    if (!selectedEventSlug || !selectedEventId) {
      message.error('Please select an event first.');
      return;
    }
    
    setIsCaching(true);
    try {
      const res = await fetch(`/api/v1/events/${selectedEventSlug}/registrations`);
      if (!res.ok) {
        throw new Error('Failed to fetch event registrations');
      }
      
      const list = await res.json();
      
      // Ensure we have an encryption key
      if (!encryptionKeyRef.current) {
        encryptionKeyRef.current = await generateEncryptionKey();
      }
      
      // Encrypt data string
      const payloadStr = JSON.stringify(list);
      const { ciphertext, iv } = await encryptData(encryptionKeyRef.current, payloadStr);
      
      // Save in IndexedDB
      const db = await openDatabase();
      const tx = db.transaction('attendees', 'readwrite');
      const store = tx.objectStore('attendees');
      
      await new Promise<void>((resolve, reject) => {
        const req = store.put({ eventId: selectedEventId, ciphertext, iv, cachedAt: new Date().toISOString() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      
      setCachedCount(list.length);
      message.success(`Cached & encrypted ${list.length} attendees for offline use.`);
    } catch (err: any) {
      message.error(`Offline caching failed: ${err.message}`);
    } finally {
      setIsCaching(false);
    }
  };

  // Perform ticket verification (online/offline routing)
  const verifyTicket = async (token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) return;

    const currentNetworkState = isOnline && !forceOffline;

    if (currentNetworkState) {
      // 1. ONLINE VERIFICATION
      try {
        if (!selectedActivityId) {
          message.error('Please select a scanning checkpoint first.');
          return;
        }

        const data = await scanTicket(selectedEventSlug, selectedActivityId, cleanToken);
        
        setScanResult({
          success: true,
          message: data.message,
          participant: {
            email: data.registration?.email || 'N/A',
            userId: data.registration?.userId || 'N/A',
            eventTitle: events.find(e => e.slug === selectedEventSlug)?.title || 'Selected Event',
          }
        });
        
        // Add to visual feed
        addToHistory({
          qrToken: cleanToken,
          email: data.registration?.email || 'N/A',
          success: true,
          offline: false,
          message: data.message,
          time: new Date().toLocaleTimeString(),
        });
      } catch (err: any) {
        setScanResult({
          success: false,
          message: err.message || 'Verification failed. Ticket invalid.',
        });
        addToHistory({
          qrToken: cleanToken,
          email: 'Unknown User',
          success: false,
          offline: false,
          message: err.message || 'Invalid Ticket',
          time: new Date().toLocaleTimeString(),
        });
      }
    } else {
      // 2. OFFLINE VERIFICATION
      await verifyTicketOffline(cleanToken);
    }
    setManualToken('');
  };

  // Offline check-in engine
  const verifyTicketOffline = async (token: string) => {
    if (!selectedEventId) {
      setScanResult({ success: false, message: 'Offline Mode: No event selected.' });
      return;
    }

    try {
      const db = await openDatabase();
      const tx = db.transaction('attendees', 'readwrite');
      const store = tx.objectStore('attendees');
      
      const record = await new Promise<any>((resolve) => {
        const req = store.get(selectedEventId);
        req.onsuccess = () => resolve(req.result);
      });

      if (!record || !encryptionKeyRef.current) {
        setScanResult({ 
          success: false, 
          message: 'Offline verification unavailable: download attendee list first.' 
        });
        return;
      }

      // Decrypt
      const { ciphertext, iv } = record;
      const decryptedJson = await decryptData(encryptionKeyRef.current, ciphertext, iv);
      const attendeeList = JSON.parse(decryptedJson);

      // Find registration matching token (case-insensitive)
      const index = attendeeList.findIndex((r: any) => r.qr_token.toLowerCase() === token.toLowerCase());
      
      if (index === -1) {
        setScanResult({ success: false, message: 'Offline Scan Result: Invalid QR Token.' });
        addToHistory({
          qrToken: token,
          email: 'Unknown',
          success: false,
          offline: true,
          message: 'Invalid Ticket (Offline)',
          time: new Date().toLocaleTimeString(),
        });
        return;
      }

      const attendee = attendeeList[index];

      if (attendee.status === 'CHECKED_IN') {
        setScanResult({
          success: true,
          alreadyCheckedIn: true,
          message: 'Duplicate Scan: Participant is already checked in (Offline Cache).',
          participant: {
            email: attendee.email,
            userId: attendee.user_id,
            eventTitle: events.find(e => e.id === selectedEventId)?.title || 'Selected Event',
          }
        });
        addToHistory({
          qrToken: token,
          email: attendee.email,
          success: true,
          offline: true,
          message: 'Duplicate Scan (Offline)',
          time: new Date().toLocaleTimeString(),
        });
      } else {
        // Mark checked-in locally
        attendee.status = 'CHECKED_IN';
        attendeeList[index] = attendee;

        // Re-encrypt updated list and save back to store
        const reEncrypted = await encryptData(encryptionKeyRef.current, JSON.stringify(attendeeList));
        const putTx = db.transaction('attendees', 'readwrite');
        const putStore = putTx.objectStore('attendees');
        putStore.put({ eventId: selectedEventId, ciphertext: reEncrypted.ciphertext, iv: reEncrypted.iv, cachedAt: new Date().toISOString() });

        // Add to pending sync store
        const syncTx = db.transaction('pending_sync', 'readwrite');
        const syncStore = syncTx.objectStore('pending_sync');
        syncStore.add({ qrToken: token, scannedAt: new Date().toISOString() });

        setScanResult({
          success: true,
          alreadyCheckedIn: false,
          message: 'Access Granted! Checked in locally.',
          participant: {
            email: attendee.email,
            userId: attendee.user_id,
            eventTitle: events.find(e => e.id === selectedEventId)?.title || 'Selected Event',
          }
        });

        addToHistory({
          qrToken: token,
          email: attendee.email,
          success: true,
          offline: true,
          message: 'Checked In (Offline)',
          time: new Date().toLocaleTimeString(),
        });

        await refreshPendingSyncCount();
      }
    } catch (err: any) {
      setScanResult({ success: false, message: `Offline verification failure: ${err.message}` });
    }
  };

  const addToHistory = (item: any) => {
    setScanHistory(prev => [item, ...prev].slice(0, 10));
  };

  // Sync offline check-ins back to server
  const syncOfflineScans = async () => {
    if (pendingSyncs.length === 0) {
      message.info('No offline check-ins to synchronize.');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/tickets/sync-offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scans: pendingSyncs }),
      });

      const data = await res.json();
      if (res.ok) {
        message.success(`Successfully synchronized ${data.syncedCount} check-ins to database.`);
        
        // Clear local queue
        const db = await openDatabase();
        const tx = db.transaction('pending_sync', 'readwrite');
        const store = tx.objectStore('pending_sync');
        await new Promise<void>((resolve, reject) => {
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        
        setPendingSyncs([]);
        // Force refresh local cache from server to keep stats perfectly matching
        if (selectedEventId) {
          await downloadAttendeesOffline();
        }
      } else {
        throw new Error(data.error || 'Server sync error');
      }
    } catch (err: any) {
      message.error(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Simulate scanning a random attendee from the cached local list
  const handleSimulatedScan = async () => {
    if (!selectedEventId) return;

    try {
      const db = await openDatabase();
      const tx = db.transaction('attendees', 'readonly');
      const store = tx.objectStore('attendees');
      const req = store.get(selectedEventId);

      req.onsuccess = async () => {
        if (req.result && encryptionKeyRef.current) {
          try {
            const { ciphertext, iv } = req.result;
            const decryptedJson = await decryptData(encryptionKeyRef.current, ciphertext, iv);
            const list = JSON.parse(decryptedJson);
            
            if (list.length === 0) {
              message.warning('Simulate failed: No attendees cached. Register some attendees first.');
              return;
            }

            // Pick a random attendee
            const randIdx = Math.floor(Math.random() * list.length);
            const randomAttendee = list[randIdx];
            
            message.info(`Simulated scanning ticket for: ${randomAttendee.email}`);
            await verifyTicket(randomAttendee.qr_token);
          } catch (e) {
            message.error('Simulate failed: Could not decrypt cache. Re-download list.');
          }
        } else {
          message.warning('Simulate failed: Cache is empty. Please cache attendees first.');
        }
      };
    } catch {
      message.error('Failed reading IndexedDB.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Upper Status Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-extrabold text-foreground leading-none">Check-In Door Scanner</h2>
          <p className="text-sm text-on-surface-variant mt-1.5 mb-0">Offline-resilient scanning dashboard for physical event check-ins.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            (isOnline && !forceOffline) 
              ? 'bg-success-container/30 text-[#006c49] border border-success/30' 
              : 'bg-error-container/30 text-error border border-error/30'
          }`}>
            {(isOnline && !forceOffline) ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span>{(isOnline && !forceOffline) ? 'ONLINE SCANNER' : 'OFFLINE MODE'}</span>
          </div>

          <Button 
            type={forceOffline ? 'primary' : 'default'} 
            danger={forceOffline}
            className="font-bold text-xs"
            onClick={() => setForceOffline(!forceOffline)}
          >
            {forceOffline ? 'Disable Offline Force' : 'Force Offline'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Controls & Sync */}
        <div className="space-y-6 lg:col-span-1">
          {/* Configuration Card */}
          <Card className="rounded-2xl border-outline-variant bg-surface-container-lowest shadow-sm" title={<span className="font-heading font-extrabold text-sm">Scanner Control Center</span>}>
            <div className="space-y-4">
              {/* Event selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Selected Event</label>
                <Select
                  value={selectedEventSlug}
                  onChange={handleEventChange}
                  className="w-full h-10 rounded-lg"
                  loading={events.length === 0}
                >
                  {events.map((e) => (
                    <Select.Option key={e.id} value={e.slug}>
                      {e.title}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Activity selection */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Scan Checkpoint</label>
                <Select
                  value={selectedActivityId || undefined}
                  onChange={(val) => setSelectedActivityId(val)}
                  className="w-full h-10 rounded-lg"
                  loading={activities.length === 0}
                  disabled={activities.length === 0}
                  placeholder="Select Checkpoint"
                >
                  {activities.map((a) => (
                    <Select.Option key={a.id} value={a.id}>
                      {a.name} {a.scan_limit === 1 ? '(Once)' : '(Unlimited)'}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Cache Stats */}
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Database size={16} />
                  <span className="text-xs font-bold">Attendees Cached Offline:</span>
                </div>
                <Tag color={cachedCount > 0 ? 'blue' : 'default'} className="font-bold m-0 text-sm">
                  {cachedCount}
                </Tag>
              </div>

              {/* Cache Download Button */}
              <Button
                type="primary"
                icon={<Download size={16} />}
                className="w-full h-10 font-bold bg-[#3525cd]"
                loading={isCaching}
                onClick={downloadAttendeesOffline}
                disabled={!isOnline || forceOffline}
              >
                Sync & Encrypt Cache
              </Button>
              
              <p className="text-[10px] text-on-surface-variant/80 italic text-center m-0">
                {!isOnline ? 'Caching requires connection' : 'Secured via local in-memory AES-GCM encryption key'}
              </p>
            </div>
          </Card>

          {/* Sync Queue Card */}
          <Card 
            className="rounded-2xl border-outline-variant bg-surface-container-lowest shadow-sm"
            title={<span className="font-heading font-extrabold text-sm flex items-center gap-2">Sync Queue {pendingSyncs.length > 0 && <Badge count={pendingSyncs.length} />}</span>}
          >
            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed m-0">
                Scans recorded while offline are queued in encrypted memory. Push them to the database when back online.
              </p>

              <Button
                type="primary"
                icon={<RefreshCw size={16} />}
                className="w-full h-10 font-bold bg-[#006c49]"
                onClick={syncOfflineScans}
                disabled={pendingSyncs.length === 0 || !isOnline || forceOffline}
                loading={isSyncing}
              >
                Sync Queued Check-Ins
              </Button>
            </div>
          </Card>
        </div>

        {/* MIDDLE COLUMN: Scanner Window */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden p-0" styles={{ body: { padding: 0 } }}>
            {/* Visual scan laser area */}
            <div className="relative h-64 bg-slate-900 flex flex-col items-center justify-center border-b border-outline-variant overflow-hidden">
              {/* Scanner Grid Lines overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }} />

              {/* Scanning Laser */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-emerald-400 animate-scan opacity-80 shadow-[0_0_12px_rgba(52,211,153,1)] z-10" />

              {/* Scanner Frame Box */}
              <div className="relative w-40 h-40 border-2 border-emerald-400/40 rounded-3xl flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                {/* Frame Corners */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                
                <Scan size={48} className="text-emerald-400/55 animate-pulse" />
              </div>

              {/* Quick simulation buttons for developers */}
              <div className="absolute bottom-4 z-20 flex gap-2">
                <Button 
                  size="small"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-0 text-xs px-3 rounded-lg"
                  onClick={handleSimulatedScan}
                >
                  Simulate Scan (Random)
                </Button>
              </div>
            </div>

            {/* Input Verification Bar */}
            <div className="p-6">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Manual Ticket Verification</label>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter QR Ticket Token..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onPressEnter={() => verifyTicket(manualToken)}
                  className="h-11 rounded-lg"
                />
                <Button 
                  type="primary" 
                  onClick={() => verifyTicket(manualToken)}
                  className="h-11 px-6 font-bold bg-[#3525cd]"
                >
                  Verify
                </Button>
              </div>
            </div>
          </Card>

          {/* Verification Feedback Result Card */}
          {scanResult && (
            <div className={`p-6 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${
              !scanResult.success 
                ? 'bg-error-container/20 border-error/30 text-error' 
                : scanResult.alreadyCheckedIn 
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-800 dark:text-yellow-200' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-[#006c49]'
            }`}>
              <div className="mt-1">
                {!scanResult.success ? (
                  <XCircle size={32} className="text-error" />
                ) : scanResult.alreadyCheckedIn ? (
                  <AlertTriangle size={32} className="text-yellow-500" />
                ) : (
                  <CheckCircle size={32} className="text-emerald-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-extrabold text-lg m-0 leading-normal">
                  {!scanResult.success ? 'Access Denied' : scanResult.alreadyCheckedIn ? 'Already Verified' : 'Access Granted'}
                </h4>
                <p className="text-sm font-semibold mt-1 mb-0 opacity-90">{scanResult.message}</p>
                
                {scanResult.participant && (
                  <div className="mt-4 p-3.5 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 text-foreground flex flex-col gap-1 text-xs">
                    <p className="m-0 font-bold">User Email: <span className="font-medium text-on-surface-variant">{scanResult.participant.email}</span></p>
                    <p className="m-0 font-bold">Attendee ID: <span className="font-medium text-on-surface-variant">{scanResult.participant.userId}</span></p>
                    <p className="m-0 font-bold">Event: <span className="font-medium text-on-surface-variant">{scanResult.participant.eventTitle}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Check-In History Log */}
          <Card className="rounded-2xl border-outline-variant bg-surface-container-lowest shadow-sm" title={<span className="font-heading font-extrabold text-sm">Real-time Check-In History</span>}>
            {scanHistory.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant/50 text-xs italic font-semibold">
                No tickets scanned in this session yet.
              </div>
            ) : (
              <List
                size="small"
                dataSource={scanHistory}
                renderItem={(item: any) => (
                  <List.Item className="px-0 py-3 flex items-center justify-between border-b border-outline-variant/30">
                    <div className="flex items-center gap-3">
                      {item.success ? (
                        <div className={`w-2.5 h-2.5 rounded-full ${item.offline ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-error" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-foreground m-0">{item.email}</p>
                        <p className="text-[10px] text-on-surface-variant/70 m-0 mt-0.5 font-mono truncate max-w-xs">{item.qrToken}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Tag color={item.success ? (item.offline ? 'warning' : 'success') : 'error'} className="font-bold text-[9px] uppercase tracking-wider">
                        {item.message}
                      </Tag>
                      <p className="text-[9px] text-on-surface-variant/50 m-0 mt-0.5 font-semibold">{item.time}</p>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
