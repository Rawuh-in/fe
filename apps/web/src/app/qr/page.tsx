'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useEvents, useGuests, parseGuestOptions, type Guest } from '@event-organizer/services';

interface GeneratedQR {
  guestId: number;
  guestName: string;
  guestEmail: string;
  hotel?: string;
  room?: string;
  qrImageUrl: string;
  generatedAt: string;
}

export default function QRManagementPage() {
  const [selectedEventId, setSelectedEventId] = useState('1');
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: eventsData } = useEvents();
  const { data: guestsData, isLoading } = useGuests(selectedEventId, { sort: 'name', dir: 'asc' });

  const generateQRForGuest = async (guest: Guest): Promise<GeneratedQR> => {
    const qrData = JSON.stringify({ guestId: guest.ID });
    const qrImageUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const options = parseGuestOptions(guest.Options);

    return {
      guestId: guest.ID,
      guestName: guest.Name,
      guestEmail: guest.Email || '',
      hotel: options.Hotel as string | undefined,
      room: options.Room as string | undefined,
      qrImageUrl,
      generatedAt: new Date().toISOString()
    };
  };

  const handleGenerateSingle = async (guest: Guest) => {
    setIsGenerating(true);
    try {
      const qr = await generateQRForGuest(guest);
      setGeneratedQRs((prev) => {
        // Replace if already exists
        const filtered = prev.filter((q) => q.guestId !== qr.guestId);
        return [...filtered, qr];
      });
    } catch (err) {
      console.error('QR generation error:', err);
      alert('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!guestsData?.Data || guestsData.Data.length === 0) {
      alert('No guests found for this event');
      return;
    }

    if (
      !confirm(
        `Generate QR codes for all ${guestsData.Data.length} guests? This may take a moment.`
      )
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const qrs = await Promise.all(guestsData.Data.map((guest) => generateQRForGuest(guest)));
      setGeneratedQRs(qrs);
    } catch (err) {
      console.error('Bulk QR generation error:', err);
      alert('Failed to generate QR codes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = (qr: GeneratedQR) => {
    const link = document.createElement('a');
    link.href = qr.qrImageUrl;
    link.download = `QR-Guest-${qr.guestId}-${qr.guestName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const downloadAllQRs = () => {
    if (generatedQRs.length === 0) {
      alert('No QR codes to download');
      return;
    }

    // Download each QR code with a small delay to avoid browser blocking
    generatedQRs.forEach((qr, index) => {
      setTimeout(() => {
        downloadQR(qr);
      }, index * 200);
    });
  };

  const clearAll = () => {
    if (confirm('Clear all generated QR codes?')) {
      setGeneratedQRs([]);
    }
  };

  const getGeneratedQR = (guestId: number) => {
    return generatedQRs.find((qr) => qr.guestId === guestId);
  };

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
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
              <p className="mt-2 text-gray-600">
                Generate QR codes for guest check-in. Each QR code contains the guest ID.
              </p>
            </div>
          </div>

          {/* Statistics and Controls */}
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event:
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      setGeneratedQRs([]);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {eventsData?.Data?.map((event) => (
                      <option key={event.ID} value={event.ID}>
                        {event.EventName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">Total Guests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {guestsData?.Data?.length || 0}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500">QR Codes Generated</p>
                  <p className="text-2xl font-bold text-blue-600">{generatedQRs.length}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {generatedQRs.length > 0 && (
                  <>
                    <button
                      onClick={downloadAllQRs}
                      disabled={isGenerating}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Download All
                    </button>
                    <button
                      onClick={clearAll}
                      disabled={isGenerating}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Clear All
                    </button>
                  </>
                )}
                <button
                  onClick={handleGenerateAll}
                  disabled={isLoading || isGenerating || !guestsData?.Data?.length}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Generating...' : 'Generate All QR Codes'}
                </button>
              </div>
            </div>
          </div>

          {/* Guest List with QR Generation */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Guest List</h2>
              <p className="text-sm text-gray-500">
                Click "Generate QR" to create a QR code for individual guests
              </p>
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
                    const options = parseGuestOptions(guest.Options);
                    const generatedQR = getGeneratedQR(guest.ID);

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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(options.Hotel as string) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(options.Room as string) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {generatedQR ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              QR Generated
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              No QR
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleGenerateSingle(guest)}
                            disabled={isGenerating}
                            className="text-blue-600 hover:text-blue-900 mr-4 disabled:opacity-50"
                          >
                            {generatedQR ? 'Regenerate QR' : 'Generate QR'}
                          </button>
                          {generatedQR && (
                            <button
                              onClick={() => downloadQR(generatedQR)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download
                            </button>
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
                No guests found for this event.{' '}
                <Link href="/admin/participants" className="text-blue-600 hover:underline">
                  Add guests
                </Link>
              </div>
            )}
          </div>

          {/* QR Code Gallery */}
          {generatedQRs.length > 0 && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">QR Code Gallery</h2>
                <p className="text-sm text-gray-500">
                  {generatedQRs.length} QR code{generatedQRs.length !== 1 ? 's' : ''} generated
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {generatedQRs.map((qr) => (
                  <div
                    key={qr.guestId}
                    className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      <img
                        src={qr.qrImageUrl}
                        alt={`QR Code for ${qr.guestName}`}
                        className="w-full h-auto mb-3"
                      />
                      <div className="border-t pt-3">
                        <h3 className="font-semibold text-gray-900">{qr.guestName}</h3>
                        <p className="text-sm text-gray-600 mb-1">Guest ID: #{qr.guestId}</p>
                        {qr.guestEmail && (
                          <p className="text-xs text-gray-500 mb-1">{qr.guestEmail}</p>
                        )}
                        {qr.hotel && (
                          <p className="text-xs text-gray-500">
                            🏨 {qr.hotel}
                            {qr.room && ` - Room ${qr.room}`}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Generated: {new Date(qr.generatedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadQR(qr)}
                        className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Download PNG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How QR Codes Work</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Each QR code contains the guest's unique ID in JSON format: {`{"guestId": 123}`}</li>
              <li>• QR codes can be scanned at the check-in station to quickly find and check in guests</li>
              <li>
                • Use "Generate All" to create QR codes for all guests at once, or generate
                individually
              </li>
              <li>• Download individual QR codes or use "Download All" for bulk download</li>
              <li>• QR codes are generated client-side using the qrcode library</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
