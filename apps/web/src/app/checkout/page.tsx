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

export default function CheckOutPage() {
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

  const handleCheckOut = async (guest: Guest) => {
    try {
      const options = parseGuestOptions(guest.Options || '{}');

      // Check if guest has checked in
      if (!options.CheckedInAt) {
        setScanResult(`⚠️ Guest ${guest.Name} has not checked in yet`);
        return;
      }

      // Add check-out timestamp
      options.CheckedOutAt = new Date().toISOString();

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
      setScanResult(`✅ Successfully checked out ${guest.Name}`);
    } catch (err) {
      console.error('Check-out error:', err);
      setScanResult(`❌ Failed to check out ${guest.Name}`);
    }
  };

  const handleManualCheckOut = () => {
    const guestId = Number.parseInt(manualGuestId, 10);
    if (Number.isNaN(guestId)) {
      setScanResult(`❌ Invalid Guest ID: ${manualGuestId}`);
      setManualGuestId('');
      return;
    }

    const guest = guestsData?.Data?.find((g) => g.ID === guestId);

    if (guest) {
      handleCheckOut(guest);
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
            handleCheckOut(guest);
            setScanResult(`✅ QR Code scanned: ${guest.Name} checked out`);
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

  // Calculate stats
  const checkedInGuests =
    guestsData?.Data?.filter((guest) => {
      const options = parseGuestOptions(guest.Options || '{}');
      return options.CheckedInAt && !options.CheckedOutAt;
    }) || [];

  const checkedOutGuests =
    guestsData?.Data?.filter((guest) => {
      const options = parseGuestOptions(guest.Options || '{}');
      return options.CheckedOutAt;
    }) || [];

  const getGuestStatus = (
    guest: Guest
  ): 'checked_out' | 'checked_in' | 'not_checked_in' => {
    const options = parseGuestOptions(guest.Options || '{}');
    if (options.CheckedOutAt) return 'checked_out';
    if (options.CheckedInAt) return 'checked_in';
    return 'not_checked_in';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'checked_out':
        return 'bg-orange-100 text-orange-800';
      case 'checked_in':
        return 'bg-green-100 text-green-800';
      case 'not_checked_in':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalGuests = guestsData?.Data?.length || 0;
  const checkedOutCount = checkedOutGuests.length;
  const checkedInCount = checkedInGuests.length;
  const checkedOutPercentage =
    totalGuests > 0 ? (checkedOutCount / totalGuests) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <nav className="bg-white shadow-sm border-b border-orange-200">
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
              <Link
                href="/checkin"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Switch to Check-in →
              </Link>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4">
              <span className="text-4xl">🚪</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              QR Check-out Station
            </h1>
            <p className="text-lg text-gray-600">
              Scan QR codes or enter guest ID to check out guests
            </p>
          </div>

          {/* Event Selection & Stats */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-orange-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(Number(e.target.value));
                  setScanResult(null);
                  setLastScanned(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                {eventsData?.Data?.map((event) => (
                  <option key={event.ID} value={event.ID}>
                    {event.EventName}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Guests</h3>
                  <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Still Checked In</h3>
                  <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-lg shadow-md border-2 border-orange-300">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg">
                  <span className="text-2xl">🚪</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-white">Checked Out</h3>
                  <p className="text-2xl font-bold text-white">{checkedOutCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Check-out Progress */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md border-2 border-orange-200">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Check-out Progress
              </span>
              <span className="text-sm font-medium text-orange-600">
                {checkedOutPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 rounded-full"
                style={{ width: `${checkedOutPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {checkedOutCount} of {totalGuests} guests have checked out
            </p>
          </div>

          {/* Scan Result Alert */}
          {scanResult && (
            <div
              className={`mb-6 p-4 rounded-lg border-2 ${
                scanResult.includes('✅')
                  ? 'bg-green-50 border-green-500 text-green-800'
                  : scanResult.includes('⚠️')
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              <p className="font-medium text-lg">{scanResult}</p>
              {lastScanned && (
                <div className="mt-2 text-sm">
                  <p>Guest ID: #{lastScanned.ID}</p>
                  <p>Email: {lastScanned.Email || 'N/A'}</p>
                  {parseGuestOptions(lastScanned.Options || '{}').CheckedOutAt ? (
                    <p>
                      Checked out at:{' '}
                      {new Date(
                        parseGuestOptions(lastScanned.Options || '{}')
                          .CheckedOutAt as string
                      ).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Check-out Actions */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* QR Code Upload */}
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">📷</span>
                Scan QR Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a QR code image to automatically check out the guest
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleQRUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4 rounded-md hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 font-semibold shadow-lg"
              >
                📱 Upload QR Code
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Note: Currently simulated - will use first guest for demo
              </p>
            </div>

            {/* Manual Entry */}
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-orange-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="text-2xl mr-2">⌨️</span>
                Manual Entry
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the guest ID to manually check out a guest
              </p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualGuestId}
                  onChange={(e) => setManualGuestId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualCheckOut()}
                  placeholder="Enter Guest ID"
                  className="flex-1 px-3 py-2 border-2 border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  disabled={isLoading}
                />
                <button
                  onClick={handleManualCheckOut}
                  disabled={isLoading || !manualGuestId.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-md hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 font-semibold shadow-lg"
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>

          {/* Guest List */}
          <div className="bg-white shadow-md overflow-hidden sm:rounded-lg border-2 border-orange-200">
            <div className="px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-xl font-semibold text-gray-900">Guest List</h2>
              <p className="text-sm text-gray-600">
                Click &quot;Check Out&quot; to manually check out guests
              </p>
            </div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
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
                      Hotel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guestsData?.Data?.map((guest) => {
                    const options = parseGuestOptions(guest.Options || '{}');
                    const status = getGuestStatus(guest);

                    return (
                      <tr
                        key={guest.ID}
                        className={
                          status === 'checked_out' ? 'bg-orange-50/50' : undefined
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{guest.ID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.Name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {guest.Email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(options.Hotel as string) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(options.Room as string) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                              status
                            )}`}
                          >
                            {status === 'checked_out'
                              ? '🚪 Checked Out'
                              : status === 'checked_in'
                                ? '✅ Checked In'
                                : '⏸️ Not Checked In'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleCheckOut(guest)}
                            disabled={
                              updateGuest.isPending ||
                              status === 'checked_out' ||
                              status === 'not_checked_in'
                            }
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                          >
                            {status === 'checked_out'
                              ? 'Already Out'
                              : status === 'not_checked_in'
                                ? 'Not Checked In'
                                : 'Check Out'}
                          </button>
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

          {/* Help Text */}
          <div className="mt-8 bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center">
              <span className="text-xl mr-2">💡</span>
              Check-out Instructions
            </h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>
                • Guests must be checked in before they can be checked out (status will
                show ✅ Checked In)
              </li>
              <li>
                • Use the QR scanner to quickly check out guests by uploading their QR
                code
              </li>
              <li>
                • Alternatively, manually enter the guest ID and click &quot;Check
                Out&quot;
              </li>
              <li>
                • The check-out timestamp is automatically recorded in the guest&apos;s
                CheckedOutAt field
              </li>
              <li>
                • Once checked out, guests cannot be checked out again (status will show
                🚪 Checked Out)
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
