'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  parseEventOptions,
  stringifyEventOptions,
  type Event,
  type EventOptions,
} from '@event-organizer/services';

export default function EventsPage() {
  const { data, isLoading, error } = useEvents({ sort: 'created_at', dir: 'desc' });
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    EventName: '',
    Description: '',
    Hotels: '',
    Rooms: '',
  });

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingEvent(null);
    setFormData({ EventName: '', Description: '', Hotels: '', Rooms: '' });
  };

  const handleCreate = async () => {
    if (!formData.EventName.trim()) {
      alert('Event name is required');
      return;
    }

    try {
      // Build Options JSON
      const options: EventOptions = {};
      if (formData.Hotels.trim()) {
        options.Hotels = formData.Hotels.split(',')
          .map((h) => h.trim())
          .filter(Boolean);
      }
      if (formData.Rooms.trim()) {
        options.Rooms = formData.Rooms.split(',')
          .map((r) => r.trim())
          .filter(Boolean);
      }

      await createEvent.mutateAsync({
        eventName: formData.EventName,
        description: formData.Description || undefined,
        options: stringifyEventOptions(options),
      });

      resetForm();
    } catch (err) {
      console.error('Create error:', err);
      alert('Failed to create event. Please check console for details.');
    }
  };

  const handleEdit = (event: Event) => {
    const options = parseEventOptions(event.Options || '{}');
    setEditingEvent(event);
    setFormData({
      EventName: event.EventName || '',
      Description: event.Description || '',
      Hotels: options.Hotels?.join(', ') || '',
      Rooms: options.Rooms?.join(', ') || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    if (!formData.EventName.trim()) {
      alert('Event name is required');
      return;
    }

    try {
      // Build Options JSON
      const options: EventOptions = {};
      if (formData.Hotels.trim()) {
        options.Hotels = formData.Hotels.split(',')
          .map((h) => h.trim())
          .filter(Boolean);
      }
      if (formData.Rooms.trim()) {
        options.Rooms = formData.Rooms.split(',')
          .map((r) => r.trim())
          .filter(Boolean);
      }

      await updateEvent.mutateAsync({
        eventId: editingEvent.ID!,
        data: {
          eventName: formData.EventName,
          description: formData.Description || undefined,
          options: stringifyEventOptions(options),
        },
      });

      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update event. Please check console for details.');
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await deleteEvent.mutateAsync(eventId);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete event. Please check console for details.');
    }
  };

  // Calculate statistics for each event (placeholder - would need separate API calls)
  // const getEventStats = (eventId: number) => {
  //   // TODO: Fetch guest count for each event
  //   return { guestCount: 0, hotelCount: 0, roomCount: 0 };
  // };

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
              <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
              <p className="mt-2 text-gray-600">Create, edit, and delete events</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Event
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Failed to load events. Check API configuration and auth token.
              <br />
              <small className="text-xs">Error: {error.message}</small>
            </div>
          )}

          {/* Form Modal */}
          {(showCreateForm || editingEvent) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Event Name *
                      </label>
                      <input
                        type="text"
                        value={formData.EventName}
                        onChange={(e) =>
                          setFormData({ ...formData, EventName: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter event name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={formData.Description}
                        onChange={(e) =>
                          setFormData({ ...formData, Description: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter event description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hotels (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.Hotels}
                        onChange={(e) =>
                          setFormData({ ...formData, Hotels: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Hotel A, Hotel B, Hotel C"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rooms (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.Rooms}
                        onChange={(e) =>
                          setFormData({ ...formData, Rooms: e.target.value })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Room 101, Room 102, Suite A"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={editingEvent ? handleUpdate : handleCreate}
                        disabled={
                          (editingEvent
                            ? updateEvent.isPending
                            : createEvent.isPending) || !formData.EventName.trim()
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editingEvent
                          ? updateEvent.isPending
                            ? 'Updating...'
                            : 'Update Event'
                          : createEvent.isPending
                            ? 'Creating...'
                            : 'Create Event'}
                      </button>
                      <button
                        onClick={resetForm}
                        disabled={createEvent.isPending || updateEvent.isPending}
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

          {/* Events Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.Data?.map((event) => {
                    const options = parseEventOptions(event.Options || '{}');
                    return (
                      <tr key={event.ID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{event.ID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {event.EventName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {event.Description || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {options.Hotels?.length ? options.Hotels.join(', ') : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {options.Rooms?.length ? options.Rooms.join(', ') : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.CreatedAt
                            ? new Date(event.CreatedAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(event)}
                            disabled={deleteEvent.isPending}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.ID!)}
                            disabled={deleteEvent.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!isLoading && (!data?.Data || data.Data.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No events found. Create your first event above.
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {data?.Pagination && (data.Pagination.TotalData ?? 0) > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {data.Data?.length ?? 0} of {data.Pagination.TotalData} events (Page{' '}
              {data.Pagination.Page} of {data.Pagination.TotalPage})
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
