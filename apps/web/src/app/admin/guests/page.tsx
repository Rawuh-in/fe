'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { toast } from '@event-organizer/ui/components/toast';
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

type TabType = 'manage' | 'assignments' | 'qr';

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
  const [activeTab, setActiveTab] = useState<TabType>('manage');
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

  const renderOptions = (optionsJson: string) => {
    const options = parseGuestOptions(optionsJson);
    if (!options || Object.keys(options).length === 0) return '-';
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  // Assignment functions
  const assignmentsWithGuests =
    data?.Data?.map((guest) => {
      const options = parseGuestOptions(guest.Options || '{}');
      return {
        guest,
        hotel: options.Hotel as string | undefined,
        room: options.Room as string | undefined,
        checkInDate: options.CheckInDate as string | undefined,
        checkOutDate: options.CheckOutDate as string | undefined,
        checkedInAt: options.CheckedInAt as string | undefined,
      };
    }) || [];

  const filteredAssignments = assignmentsWithGuests.filter((assignment) => {
    if (filterStatus === 'assigned') {
      return assignment.hotel || assignment.room;
    } else if (filterStatus === 'unassigned') {
      return !assignment.hotel && !assignment.room;
    }
    return true;
  });

  const getCheckInStatus = (assignment: (typeof assignmentsWithGuests)[0]) => {
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

  const stats = {
    total: assignmentsWithGuests.length,
    assigned: assignmentsWithGuests.filter((a) => a.hotel || a.room).length,
    checkedIn: assignmentsWithGuests.filter((a) => a.checkedInAt).length,
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

    const options = parseGuestOptions(guest.Options || '{}');

    return {
      guestId: guest.ID!,
      guestName: guest.Name!,
      guestEmail: guest.Email || '',
      hotel: options.Hotel as string | undefined,
      room: options.Room as string | undefined,
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
    } catch (err) {
      console.error('QR generation error:', err);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!data?.Data || data.Data.length === 0) {
      toast.error('No guests found for this event');
      return;
    }

    if (
      !confirm(
        `Generate QR codes for all ${data.Data.length} guests? This may take a moment.`
      )
    ) {
      return;
    }

    setIsGenerating(true);
    try {
      const qrs = await Promise.all(data.Data.map((guest) => generateQRForGuest(guest)));
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

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('manage')}
                className={`${
                  activeTab === 'manage'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                🎫 Manage Guests
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`${
                  activeTab === 'assignments'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                🏨 View Assignments
              </button>
              <button
                onClick={() => setActiveTab('qr')}
                className={`${
                  activeTab === 'qr'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                📱 QR Codes
              </button>
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Failed to load guests. Check API configuration and auth token.
              <br />
              <small className="text-xs">Error: {error.message}</small>
            </div>
          )}

          {/* Tab Content: Manage Guests */}
          {activeTab === 'manage' && (
            <div>
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Guest
                </button>
              </div>

              {/* Form Modal */}
              {(showCreateForm || editingGuest) && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                  <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                    <div className="mt-3">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingGuest ? 'Edit Guest' : 'Add New Guest'}
                      </h3>
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
                            Address
                          </label>
                          <textarea
                            value={formData.Address}
                            onChange={(e) =>
                              setFormData({ ...formData, Address: e.target.value })
                            }
                            rows={2}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Full address"
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
                            Optional: Add custom fields like hotel, room, dietary restrictions,
                            etc.
                          </small>
                        </div>
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={editingGuest ? handleUpdate : handleCreate}
                            disabled={
                              (editingGuest
                                ? updateGuest.isPending
                                : createGuest.isPending) || !formData.Name.trim()
                            }
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {editingGuest
                              ? updateGuest.isPending
                                ? 'Updating...'
                                : 'Update Guest'
                              : createGuest.isPending
                                ? 'Adding...'
                                : 'Add Guest'}
                          </button>
                          <button
                            onClick={resetForm}
                            disabled={createGuest.isPending || updateGuest.isPending}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guests Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
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
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Custom Data
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data?.Data?.map((guest) => (
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
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div
                              className="max-w-xs truncate"
                              title={renderOptions(guest.Options || '{}')}
                            >
                              {renderOptions(guest.Options || '{}')}
                            </div>
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
                      ))}
                    </tbody>
                  </table>
                )}
                {!isLoading && (!data?.Data || data.Data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No guests found for this event. Add your first guest above.
                  </div>
                )}
              </div>

              {/* Pagination Info */}
              {data?.Pagination && (data.Pagination.TotalData ?? 0) > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Showing {data.Data?.length ?? 0} of {data.Pagination.TotalData} guests (Page{' '}
                  {data.Pagination.Page} of {data.Pagination.TotalPage})
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Assignments */}
          {activeTab === 'assignments' && (
            <div>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">📋</span>
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
              </div>

              {/* Filter */}
              <div className="mb-6 flex items-center justify-end">
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
              </div>

              {/* Assignments Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-500">Loading assignments...</p>
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
                          Check-in Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssignments.map((assignment) => {
                        const status = getCheckInStatus(assignment);
                        return (
                          <tr key={assignment.guest.ID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              #{assignment.guest.ID}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.guest.Name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.guest.Email || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.hotel || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {assignment.room || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.checkInDate
                                ? new Date(assignment.checkInDate).toLocaleDateString()
                                : '-'}
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                {!isLoading && filteredAssignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {filterStatus === 'assigned'
                      ? 'No assigned guests found.'
                      : filterStatus === 'unassigned'
                        ? 'No unassigned guests found.'
                        : 'No guests found for this event.'}
                  </div>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-md p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">
                  💡 How to Manage Assignments
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>
                    • Assignments are stored in Guest Options as JSON data (Hotel, Room,
                    CheckInDate, etc.)
                  </li>
                  <li>
                    • To assign a guest: Switch to the{' '}
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="underline font-medium"
                    >
                      Manage Guests
                    </button>{' '}
                    tab and edit their custom data
                  </li>
                  <li>
                    • Example Options JSON:{' '}
                    <code className="bg-purple-100 px-1 rounded">
                      {`{"Hotel": "Hotel A", "Room": "101", "CheckInDate": "2025-01-15"}`}
                    </code>
                  </li>
                  <li>
                    • Check-in status is automatically tracked via the CheckedInAt field
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content: QR Codes */}
          {activeTab === 'qr' && (
            <div>
              {/* Statistics and Controls */}
              <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-sm">
                      <p className="text-gray-500">Total Guests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {data?.Data?.length || 0}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">QR Codes Generated</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {generatedQRs.length}
                      </p>
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
                      disabled={isLoading || isGenerating || !data?.Data?.length}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Click &quot;Generate QR&quot; to create a QR code for individual guests
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
                      {data?.Data?.map((guest) => {
                        const options = parseGuestOptions(guest.Options || '{}');
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
                                className="text-purple-600 hover:text-purple-900 mr-4 disabled:opacity-50"
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
                {!isLoading && (!data?.Data || data.Data.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No guests found for this event.{' '}
                    <button
                      onClick={() => setActiveTab('manage')}
                      className="text-purple-600 hover:underline"
                    >
                      Add guests
                    </button>
                  </div>
                )}
              </div>

              {/* QR Code Gallery */}
              {generatedQRs.length > 0 && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">QR Code Gallery</h2>
                    <p className="text-sm text-gray-500">
                      {generatedQRs.length} QR code{generatedQRs.length !== 1 ? 's' : ''}{' '}
                      generated
                    </p>
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
                            <h3 className="font-semibold text-gray-900">{qr.guestName}</h3>
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
                  How QR Codes Work
                </h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>
                    • Each QR code contains the guest&apos;s unique ID in JSON format:{' '}
                    {`{"guestId": 123}`}
                  </li>
                  <li>
                    • QR codes can be scanned at the check-in station to quickly find and check
                    in guests
                  </li>
                  <li>
                    • Use &quot;Generate All&quot; to create QR codes for all guests at once, or
                    generate individually
                  </li>
                  <li>
                    • Download individual QR codes or use &quot;Download All&quot; for bulk
                    download
                  </li>
                  <li>• QR codes are generated client-side using the qrcode library</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
