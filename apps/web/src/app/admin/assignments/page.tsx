'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEvents, useGuests, parseGuestOptions } from '@event-organizer/services';

export default function AssignmentsPage() {
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>(
    'all'
  );

  const { data: eventsData } = useEvents();
  const { data: guestsData, isLoading } = useGuests(selectedEventId, {
    sort: 'name',
    dir: 'asc',
  });

  // Extract assignment data from Guest Options
  const assignmentsWithGuests =
    guestsData?.Data?.map((guest) => {
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

  // Filter based on assignment status
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Guest Assignments</h1>
            <p className="mt-2 text-gray-600">
              View hotel and room assignments for event guests
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Note: Assignments are managed in Guest Options. Edit guests to update their
              hotel/room assignments.
            </p>
          </div>

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

          {/* Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Event:</label>
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
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as 'all' | 'assigned' | 'unassigned')
                }
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Guests</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
              <Link
                href="/admin/participants"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Edit Assignments →
              </Link>
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
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              💡 How to Manage Assignments
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Assignments are stored in Guest Options as JSON data (Hotel, Room,
                CheckInDate, etc.)
              </li>
              <li>
                • To assign a guest: Go to{' '}
                <Link href="/admin/participants" className="underline font-medium">
                  Manage Guests
                </Link>{' '}
                and edit their custom data
              </li>
              <li>
                • Example Options JSON:{' '}
                <code className="bg-blue-100 px-1 rounded">
                  {`{"Hotel": "Hotel A", "Room": "101", "CheckInDate": "2025-01-15"}`}
                </code>
              </li>
              <li>
                • Check-in status is automatically tracked via the CheckedInAt field
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
