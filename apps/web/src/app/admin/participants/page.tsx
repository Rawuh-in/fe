'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export default function ParticipantsPage() {
  const [selectedEventId, setSelectedEventId] = useState(1); // Default to first event
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
    customData: '', // JSON string for custom options
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
      // Parse custom data if provided
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Guests</h1>
              <p className="mt-2 text-gray-600">
                Add and manage event guests (participants)
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {eventsData?.Data?.map((event) => (
                  <option key={event.ID} value={event.ID}>
                    {event.EventName}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Guest
              </button>
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder='{"company": "Tech Corp", "jobTitle": "Developer"}'
                      />
                      <small className="text-gray-500 text-xs">
                        Optional: Add custom fields like hotel, room, dietary
                        restrictions, etc.
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Address
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
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        -
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
      </main>
    </div>
  );
}
