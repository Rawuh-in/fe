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
  type GuestOptions
} from '@event-organizer/services';

export default function CheckInPage() {
  const [selectedEventId, setSelectedEventId] = useState('1');
  const [manualGuestId, setManualGuestId] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<Guest | null>(null);

  const { data: eventsData } = useEvents();
  const { data: guestsData, isLoading } = useGuests(selectedEventId, { sort: 'name', dir: 'asc' });
  const updateGuest = useUpdateGuest();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCheckIn = async (guest: Guest) => {
    try {
      const options: GuestOptions = parseGuestOptions(guest.Options);

      // Add check-in timestamp
      options.CheckedInAt = new Date().toISOString();

      await updateGuest.mutateAsync({
        eventId: selectedEventId,
        guestId: guest.ID.toString(),
        data: {
          Name: guest.Name,
          Email: guest.Email,
          Phone: guest.Phone,
          Address: guest.Address,
          Options: stringifyGuestOptions(options)
        }
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
    const options = parseGuestOptions(guest.Options);
    return options.CheckedInAt ? 'checked_in' : 'not_checked_in';
  };

  const getCheckInTime = (guest: Guest) => {
    const options = parseGuestOptions(guest.Options);
    return options.CheckedInAt
      ? new Date(options.CheckedInAt).toLocaleString()
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

  const checkedInCount = guestsData?.Data?.filter(g => getCheckInStatus(g) === 'checked_in').length || 0;
  const totalCount = guestsData?.Data?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-gray-900">
                  🎉 Event Organizer
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Guest Check-in Station</h1>
            <p className="mt-2 text-gray-600">Scan QR codes or enter Guest ID manually</p>
          </div>

          {/* Event Selector and Stats */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Event:</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {eventsData?.Data?.map((event) => (
                  <option key={event.ID} value={event.ID}>
                    {event.EventName}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">{checkedInCount}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> guests checked in
            </div>
          </div>

          {/* Check-in Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Manual Entry */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Guest ID
                  </label>
                  <input
                    type="text"
                    value={manualGuestId}
                    onChange={(e) => setManualGuestId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualCheckIn()}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 123"
                  />
                </div>
                <button
                  onClick={handleManualCheckIn}
                  disabled={updateGuest.isPending}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updateGuest.isPending ? 'Checking in...' : 'Check In'}
                </button>
              </div>
            </div>

            {/* QR Code Scanner */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Scanner</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload a QR code image to check in a guest
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updateGuest.isPending}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  📷 Upload QR Code Image
                </button>
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG (simulated for demo)
                </p>
              </div>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div
              className={`mb-6 p-4 rounded-md ${
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Guest List</h3>
            </div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading guests...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guestsData?.Data?.map((guest) => {
                    const status = getCheckInStatus(guest);
                    const checkInTime = getCheckInTime(guest);
                    return (
                      <tr key={guest.ID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{guest.ID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {checkInTime || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {status === 'not_checked_in' && (
                            <button
                              onClick={() => handleCheckIn(guest)}
                              disabled={updateGuest.isPending}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
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
            )}
            {!isLoading && (!guestsData?.Data || guestsData.Data.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No guests found for this event.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
