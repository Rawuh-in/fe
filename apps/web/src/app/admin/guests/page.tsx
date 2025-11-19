'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { toast } from '@event-organizer/ui/components/toast';
import { Modal } from '@event-organizer/ui';
import { Button } from '@event-organizer/ui';
import { AppShell } from '@/components/layout/app-shell';
import {
  useGuests,
  useEvents,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
  parseGuestOptions,
  stringifyGuestOptions,
  type Guest,
  type GuestCustomData,
} from '@event-organizer/services';

interface GeneratedQR {
  guestId: number;
  guestName: string;
  guestEmail: string;
  hotel?: string;
  room?: string;
  qrImageUrl: string;
  generatedAt: string;
}

export default function GuestManagementPage() {
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>(
    'all'
  );
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: eventsData } = useEvents();
  const { data, isLoading, error } = useGuests(selectedEventId, {
    sort: 'created_at',
    dir: 'desc',
  });
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Address: '',
    customData: '',
  });

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingGuest(null);
    setFormData({
      Name: '',
      Email: '',
      Phone: '',
      Address: '',
      customData: '',
    });
  };

  const handleCreate = async () => {
    if (!formData.Name.trim()) {
      toast.error('Guest name is required');
      return;
    }

    try {
      let options: GuestCustomData = {};
      if (formData.customData.trim()) {
        try {
          options = JSON.parse(formData.customData);
        } catch {
          toast.error('Invalid JSON format for custom data');
          return;
        }
      }

      await createGuest.mutateAsync({
        eventId: selectedEventId,
        data: {
          guestName: formData.Name,
          email: formData.Email || undefined,
          phoneNumber: formData.Phone || undefined,
          customData: stringifyGuestOptions(options),
          eventID: selectedEventId,
        },
      });

      toast.success(`Guest "${formData.Name}" added successfully`);
      resetForm();
    } catch (err) {
      console.error('Create error:', err);
      toast.error('Failed to create guest. Please try again.');
    }
  };

  const handleEdit = (guest: Guest) => {
    const options = parseGuestOptions(guest.Options || '{}');
    setEditingGuest(guest);
    setFormData({
      Name: guest.Name || '',
      Email: guest.Email || '',
      Phone: guest.Phone || '',
      Address: '',
      customData: JSON.stringify(options, null, 2),
    });
  };

  const handleUpdate = async () => {
    if (!editingGuest) return;
    if (!formData.Name.trim()) {
      toast.error('Guest name is required');
      return;
    }

    try {
      let options: GuestCustomData = {};
      if (formData.customData.trim()) {
        try {
          options = JSON.parse(formData.customData);
        } catch {
          toast.error('Invalid JSON format for custom data');
          return;
        }
      }

      await updateGuest.mutateAsync({
        eventId: selectedEventId,
        guestId: editingGuest.ID!,
        data: {
          guestName: formData.Name,
          email: formData.Email || undefined,
          phoneNumber: formData.Phone || undefined,
          customData: stringifyGuestOptions(options),
        },
      });

      toast.success(`Guest "${formData.Name}" updated successfully`);
      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update guest. Please try again.');
    }
  };

  const handleDelete = async (guestId: number) => {
    if (!confirm('Are you sure you want to remove this guest from the event?')) return;

    try {
      await deleteGuest.mutateAsync({ eventId: selectedEventId, guestId });
      toast.success('Guest removed successfully');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete guest. Please try again.');
    }
  };

  // Assignment and status functions
  const getGuestAssignment = (guest: Guest) => {
    const options = parseGuestOptions(guest.Options || '{}');
    return {
      hotel: options.Hotel as string | undefined,
      room: options.Room as string | undefined,
      checkInDate: options.CheckInDate as string | undefined,
      checkedInAt: options.CheckedInAt as string | undefined,
    };
  };

  const getCheckInStatus = (guest: Guest) => {
    const assignment = getGuestAssignment(guest);
    if (assignment.checkedInAt) return 'checked_in';
    if (assignment.hotel || assignment.room) return 'assigned';
    return 'unassigned';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'unassigned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter guests based on assignment status
  const filteredGuests =
    data?.Data?.filter((guest) => {
      const assignment = getGuestAssignment(guest);
      if (filterStatus === 'assigned') {
        return assignment.hotel || assignment.room;
      } else if (filterStatus === 'unassigned') {
        return !assignment.hotel && !assignment.room;
      }
      return true;
    }) || [];

  const stats = {
    total: data?.Data?.length || 0,
    assigned:
      data?.Data?.filter((g) => {
        const a = getGuestAssignment(g);
        return a.hotel || a.room;
      }).length || 0,
    checkedIn: data?.Data?.filter((g) => getGuestAssignment(g).checkedInAt).length || 0,
    qrGenerated: generatedQRs.length,
  };

  // QR Code functions
  const generateQRForGuest = async (guest: Guest): Promise<GeneratedQR> => {
    const qrData = JSON.stringify({ guestId: guest.ID });
    const qrImageUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const assignment = getGuestAssignment(guest);

    return {
      guestId: guest.ID!,
      guestName: guest.Name!,
      guestEmail: guest.Email || '',
      hotel: assignment.hotel,
      room: assignment.room,
      qrImageUrl,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleGenerateSingle = async (guest: Guest) => {
    setIsGenerating(true);
    try {
      const qr = await generateQRForGuest(guest);
      setGeneratedQRs((prev) => {
        const filtered = prev.filter((q) => q.guestId !== qr.guestId);
        return [...filtered, qr];
      });
      toast.success(`QR code generated for ${guest.Name}`);
    } catch (err) {
      console.error('QR generation error:', err);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!filteredGuests || filteredGuests.length === 0) {
      toast.error('No guests found');
      return;
    }

    if (
      !confirm(
        `Generate QR codes for all ${filteredGuests.length} guests? This may take a moment.`
      )
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const qrs = await Promise.all(
        filteredGuests.map((guest) => generateQRForGuest(guest))
      );
      setGeneratedQRs(qrs);
      toast.success(`Generated ${qrs.length} QR codes successfully`);
    } catch (err) {
      console.error('Bulk QR generation error:', err);
      toast.error('Failed to generate QR codes. Please try again.');
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
      toast.error('No QR codes to download');
      return;
    }

    generatedQRs.forEach((qr, index) => {
      setTimeout(() => {
        downloadQR(qr);
      }, index * 200);
    });
  };

  const getGeneratedQR = (guestId: number) => {
    return generatedQRs.find((qr) => qr.guestId === guestId);
  };

  return (
    <AppShell>
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
              <p className="mt-2 text-gray-600">
                Manage guests, assignments, and QR codes all in one place
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(Number(e.target.value));
                  setGeneratedQRs([]);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                {eventsData?.Data?.map((event) => (
                  <option key={event.ID} value={event.ID}>
                    {event.EventName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Failed to load guests. Check API configuration and auth token.
              <br />
              <small className="text-xs">Error: {error.message}</small>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Guests</h3>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🏨</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Assigned</h3>
                  <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Checked In</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <span className="text-2xl">📱</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">QR Generated</h3>
                  <p className="text-2xl font-bold text-indigo-600">
                    {stats.qrGenerated}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as 'all' | 'assigned' | 'unassigned')
                }
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Guests</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
            </div>
            <div className="flex space-x-3">
              {generatedQRs.length > 0 && (
                <button
                  onClick={downloadAllQRs}
                  disabled={isGenerating}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Download All QR Codes
                </button>
              )}
              <button
                onClick={handleGenerateAll}
                disabled={isLoading || isGenerating || filteredGuests.length === 0}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate All QR Codes'}
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Guest
              </button>
            </div>
          </div>

          {/* Form Modal */}
          <Modal
            isOpen={showCreateForm || !!editingGuest}
            onClose={resetForm}
            title={editingGuest ? 'Edit Guest' : 'Add New Guest'}
            footer={
              <>
                <Button variant="ghost" onClick={resetForm} disabled={createGuest.isPending || updateGuest.isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={editingGuest ? handleUpdate : handleCreate}
                  disabled={
                    (editingGuest
                      ? updateGuest.isPending
                      : createGuest.isPending) || !formData.Name.trim()
                  }
                >
                  {editingGuest
                    ? updateGuest.isPending
                      ? 'Updating...'
                      : 'Update Guest'
                    : createGuest.isPending
                      ? 'Adding...'
                      : 'Add Guest'}
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Name: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Guest full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData({ ...formData, Email: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="guest@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.Phone}
                  onChange={(e) =>
                    setFormData({ ...formData, Phone: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Custom Data (JSON)
                </label>
                <textarea
                  value={formData.customData}
                  onChange={(e) =>
                    setFormData({ ...formData, customData: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                  placeholder='{"Hotel": "Hotel A", "Room": "101", "CheckInDate": "2025-01-15"}'
                />
                <small className="text-gray-500 text-xs">
                  Add hotel, room, check-in dates, and other custom fields
                </small>
              </div>
            </div>
          </Modal>

          {/* Unified Guest Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading guests...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredGuests.map((guest) => {
                      const assignment = getGuestAssignment(guest);
                      const status = getCheckInStatus(guest);
                      const generatedQR = getGeneratedQR(guest.ID!);

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
                            {guest.Phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.hotel || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignment.room || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                                status
                              )}`}
                            >
                              {status === 'checked_in'
                                ? 'Checked In'
                                : status === 'assigned'
                                  ? 'Assigned'
                                  : 'Unassigned'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {generatedQR ? (
                              <div className="flex items-center space-x-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Generated
                                </span>
                                <button
                                  onClick={() => downloadQR(generatedQR)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Download QR"
                                >
                                  ⬇️
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleGenerateSingle(guest)}
                                disabled={isGenerating}
                                className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 text-xs"
                              >
                                Generate
                              </button>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(guest)}
                              disabled={deleteGuest.isPending}
                              className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(guest.ID!)}
                              disabled={deleteGuest.isPending}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deleteGuest.isPending ? 'Removing...' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!isLoading && filteredGuests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {filterStatus === 'assigned'
                  ? 'No assigned guests found.'
                  : filterStatus === 'unassigned'
                    ? 'No unassigned guests found.'
                    : 'No guests found for this event. Add your first guest above.'}
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {data?.Pagination && (data.Pagination.TotalData ?? 0) > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {filteredGuests.length} of {data.Pagination.TotalData} guests (Page{' '}
              {data.Pagination.Page} of {data.Pagination.TotalPage})
            </div>
          )}

          {/* QR Code Gallery */}
          {generatedQRs.length > 0 && (
            <div className="mt-12">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">📱</span>
                    Generated QR Codes
                  </h2>
                  <p className="mt-1 text-gray-600">
                    {generatedQRs.length} QR code{generatedQRs.length !== 1 ? 's' : ''}{' '}
                    ready for download
                  </p>
                </div>
                <button
                  onClick={() => setGeneratedQRs([])}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {generatedQRs.map((qr) => (
                  <div
                    key={qr.guestId}
                    className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qr.qrImageUrl}
                        alt={`QR Code for ${qr.guestName}`}
                        className="w-full h-auto mb-3"
                      />
                      <div className="border-t pt-3">
                        <h4 className="font-semibold text-gray-900">{qr.guestName}</h4>
                        <p className="text-sm text-gray-600 mb-1">
                          Guest ID: #{qr.guestId}
                        </p>
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
                        className="mt-3 w-full bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
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
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-md p-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-2">
              💡 Guest Management Guide
            </h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>
                • <strong>Assignments:</strong> Edit a guest to add hotel/room information
                in the Custom Data field
              </li>
              <li>
                • <strong>Status:</strong> Automatically tracks Unassigned → Assigned →
                Checked In
              </li>
              <li>
                • <strong>QR Codes:</strong> Generate individual codes or bulk generate
                for all guests
              </li>
              <li>
                • <strong>Filter:</strong> Use the filter dropdown to view only assigned
                or unassigned guests
              </li>
              <li>
                • Example Custom Data:{' '}
                <code className="bg-purple-100 px-1 rounded">
                  {`{"Hotel": "Grand Plaza", "Room": "101", "CheckInDate": "2025-01-15"}`}
                </code>
              </li>
            </ul>
          </div>
    </AppShell>
  );
}
