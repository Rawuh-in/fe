'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  useEvents,
  useGuests,
  useUpdateGuest,
  parseGuestOptions,
  stringifyGuestOptions,
  type Guest,
} from '@event-organizer/services';
import { AppShell, Skeleton } from '@event-organizer/ui';

export default function CheckInPage() {
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [manualGuestId, setManualGuestId] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<Guest | null>(null);

  const { data: eventsData } = useEvents();
  const { data: guestsData, isLoading } = useGuests(selectedEventId, {
    sort: 'name',
    dir: 'asc',
  });
  const updateGuest = useUpdateGuest();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckIn = async (guest: Guest) => {
    try {
      const options = parseGuestOptions(guest.Options || '{}');

      // Add check-in timestamp
      options.CheckedInAt = new Date().toISOString();

      await updateGuest.mutateAsync({
        eventId: selectedEventId,
        guestId: guest.ID!,
        data: {
          guestName: guest.Name!,
          email: guest.Email,
          phoneNumber: guest.Phone,
          customData: stringifyGuestOptions(options),
        },
      });

      setLastScanned(guest);
      setScanResult(`✅ Successfully checked in ${guest.Name}`);
    } catch (err) {
      console.error('Check-in error:', err);
      setScanResult(`❌ Failed to check in ${guest.Name}`);
    }
  };

  const handleManualCheckIn = () => {
    const guestId = Number.parseInt(manualGuestId, 10);
    if (Number.isNaN(guestId)) {
      setScanResult(`❌ Invalid Guest ID: ${manualGuestId}`);
      setManualGuestId('');
      return;
    }

    const guest = guestsData?.Data?.find((g) => g.ID === guestId);

    if (guest) {
      handleCheckIn(guest);
    } else {
      setScanResult(`❌ Guest not found with ID: ${manualGuestId}`);
    }

    setManualGuestId('');
  };

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          // In production, this would decode actual QR image
          // For now, simulate QR data: {"guestId": 123}
          const mockQrData = `{"guestId": ${guestsData?.Data?.[0]?.ID || 1}}`;
          const parsed = JSON.parse(mockQrData);

          const guest = guestsData?.Data?.find((g) => g.ID === parsed.guestId);

          if (guest) {
            handleCheckIn(guest);
            setScanResult(`✅ QR Code scanned: ${guest.Name} checked in`);
          } else {
            setScanResult(`❌ Invalid QR code - guest not found`);
          }
        } catch {
          setScanResult(`❌ Invalid QR code format`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getCheckInStatus = (guest: Guest) => {
    const options = parseGuestOptions(guest.Options || '{}');
    return options.CheckedInAt ? 'checked_in' : 'not_checked_in';
  };

  const getCheckInTime = (guest: Guest) => {
    const options = parseGuestOptions(guest.Options || '{}');
    return options.CheckedInAt
      ? new Date(options.CheckedInAt as string).toLocaleString()
      : null;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'bg-green-100 text-green-800';
      case 'not_checked_in':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const checkedInCount =
    guestsData?.Data?.filter((g) => getCheckInStatus(g) === 'checked_in').length || 0;
  const totalCount = guestsData?.Data?.length || 0;

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--eo-fg)]">Guest Check-in Station</h1>
        <p className="mt-2 text-[var(--eo-muted-text)]">Scan QR codes or enter Guest ID manually</p>
      </div>

      {/* Event Selector and Stats */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-[var(--eo-fg)]">Event:</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(Number(e.target.value))}
            className="px-3 py-2 border border-[var(--eo-muted)] rounded-[var(--eo-radius-md)] shadow-sm focus:outline-none focus:ring-[var(--eo-primary)] focus:border-[var(--eo-primary)] bg-[var(--eo-bg-elevated)]"
          >
            {eventsData?.Data?.map((event) => (
              <option key={event.ID} value={event.ID}>
                {event.EventName}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-[var(--eo-muted-text)]">
          <span className="font-semibold text-green-600">{checkedInCount}</span> of{' '}
          <span className="font-semibold">{totalCount}</span> guests checked in
        </div>
      </div>

      {/* Check-in Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* QR Scanner Section - Primary on Mobile */}
        <div className="lg:col-span-2 xl:col-span-1">
          <div className="bg-black rounded-[var(--eo-radius-lg)] overflow-hidden relative aspect-square md:aspect-video flex flex-col items-center justify-center text-white shadow-[var(--eo-shadow-md)]">

            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 border-[2px] border-white/30 m-8 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-64 h-1 bg-red-500/50 animate-pulse absolute top-1/2"></div>
            </div>

            <div className="z-10 text-center p-6">
              <div className="mb-4 bg-white/10 p-4 rounded-full inline-block">
                <span className="text-4xl">📷</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Tap to Scan</h3>
              <p className="text-white/70 text-sm mb-6">Point camera at guest QR code</p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={updateGuest.isPending}
                className="bg-[var(--eo-primary)] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-lg border-2 border-white/20 disabled:opacity-50"
              >
                {updateGuest.isPending ? 'Processing...' : 'Activate Camera'}
              </button>
            </div>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleQRUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Manual Entry */}
        <div className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border border-[var(--eo-muted)]">
          <h3 className="text-lg font-semibold text-[var(--eo-fg)] mb-4">Manual Entry</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--eo-fg)] mb-2">
                Enter Guest ID
              </label>
              <input
                type="text"
                value={manualGuestId}
                onChange={(e) => setManualGuestId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                className="block w-full px-3 py-2 border border-[var(--eo-muted)] rounded-[var(--eo-radius-md)] shadow-sm focus:outline-none focus:ring-[var(--eo-primary)] focus:border-[var(--eo-primary)] bg-[var(--eo-bg)]"
                placeholder="e.g., 123"
              />
            </div>
            <button
              onClick={handleManualCheckIn}
              disabled={updateGuest.isPending}
              className="w-full bg-[var(--eo-primary)] text-white px-4 py-2 rounded-[var(--eo-radius-md)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {updateGuest.isPending ? 'Checking in...' : 'Check In'}
            </button>
          </div>
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div
          className={`mb-6 p-4 rounded-[var(--eo-radius-md)] ${
            scanResult.includes('✅')
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="font-medium">{scanResult}</p>
          {lastScanned && scanResult.includes('✅') && (
            <div className="mt-2 text-sm">
              <p>Guest: {lastScanned.Name}</p>
              <p>Email: {lastScanned.Email || 'N/A'}</p>
              <p>Phone: {lastScanned.Phone || 'N/A'}</p>
            </div>
          )}
        </div>
      )}

      {/* Guest List */}
      <div className="bg-[var(--eo-bg-elevated)] shadow-[var(--eo-shadow-sm)] overflow-hidden rounded-[var(--eo-radius-lg)] border border-[var(--eo-muted)]">
        <div className="px-6 py-4 border-b border-[var(--eo-muted)]">
          <h3 className="text-lg font-semibold text-[var(--eo-fg)]">Guest List</h3>
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-20 ml-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--eo-muted)]">
              <thead className="bg-[var(--eo-bg)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--eo-muted-text)] uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--eo-muted-text)] uppercase tracking-wider">
                    Guest Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--eo-muted-text)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--eo-muted-text)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--eo-muted-text)] uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--eo-muted-text)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--eo-bg-elevated)] divide-y divide-[var(--eo-muted)]">
                {guestsData?.Data?.map((guest) => {
                  const status = getCheckInStatus(guest);
                  const checkInTime = getCheckInTime(guest);
                  return (
                    <tr key={guest.ID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--eo-muted-text)]">
                        #{guest.ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--eo-fg)]">
                        {guest.Name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--eo-muted-text)]">
                        {guest.Email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                            status
                          )}`}
                        >
                          {status === 'checked_in' ? 'Checked In' : 'Not Checked In'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--eo-muted-text)]">
                        {checkInTime || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {status === 'not_checked_in' && (
                          <button
                            onClick={() => handleCheckIn(guest)}
                            disabled={updateGuest.isPending}
                            className="text-[var(--eo-primary)] hover:opacity-80 disabled:opacity-50"
                          >
                            Check In
                          </button>
                        )}
                        {status === 'checked_in' && (
                          <span className="text-green-600">✓ Checked In</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && (!guestsData?.Data || guestsData.Data.length === 0) && (
          <div className="text-center py-8 text-[var(--eo-muted-text)]">
            No guests found for this event.
          </div>
        )}
      </div>
    </AppShell>
  );
}
