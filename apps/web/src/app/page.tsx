'use client';

import Link from 'next/link';
import { useEvents, useUsers, parseEventOptions } from '@event-organizer/services';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 10, sort: 'created_at', dir: 'desc' });
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 1 }); // Just for count

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Calculate statistics from real data
  const stats = {
    events: eventsData?.pagination?.totalRows || 0,
    users: usersData?.pagination?.totalRows || 0,
    // Note: Guests count would need to aggregate across all events
    // For now, we'll show a placeholder
    guests: '—',
    assignments: '—'
  };

  const isLoading = eventsLoading || usersLoading;

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
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/events"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Events
                </Link>
                <Link
                  href="/admin/users"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Users
                </Link>
                <Link
                  href="/checkin"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Check-in
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Event Organizer Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage events, guests, and check-ins efficiently
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Events</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {isLoading ? '...' : stats.events}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Staff Users</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {isLoading ? '...' : stats.users}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🎫</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Guests</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.guests}
                  </p>
                  <small className="text-xs text-gray-500">Select event to view</small>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">🏨</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Assignments</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.assignments}
                  </p>
                  <small className="text-xs text-gray-500">In guest data</small>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
            <Link
              href="/admin/events"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Events
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading events...</p>
              </div>
            ) : eventsData?.data && eventsData.data.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {eventsData.data.map((event) => {
                  const options = parseEventOptions(event.options);
                  return (
                    <li key={event.eventID} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {event.eventName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {event.description || 'No description'}
                              </p>
                              <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                <span>
                                  {options.Hotels?.length || 0} hotels
                                </span>
                                <span>
                                  {options.Rooms?.length || 0} rooms
                                </span>
                                <span>
                                  Created {new Date(event.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/participants`}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Manage Guests
                          </Link>
                          <Link
                            href={`/qr`}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            QR Codes
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No events found. Create your first event!
              </div>
            )}
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Link
              href="/admin/events"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                    Manage Events
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Create and configure events with hotels/rooms
                  </p>
                </div>
                <span className="text-3xl">📅</span>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">
                    Manage Staff Users
                  </h3>
                  <p className="mt-1 text-gray-600">Add system administrators and staff</p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
            </Link>

            <Link
              href="/admin/participants"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                    Manage Guests
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Add event guests with custom data
                  </p>
                </div>
                <span className="text-3xl">🎫</span>
              </div>
            </Link>

            <Link
              href="/admin/assignments"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">
                    View Assignments
                  </h3>
                  <p className="mt-1 text-gray-600">Guest hotel and room assignments</p>
                </div>
                <span className="text-3xl">🏨</span>
              </div>
            </Link>

            <Link
              href="/qr"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    QR Code Management
                  </h3>
                  <p className="mt-1 text-gray-600">Generate and download QR codes</p>
                </div>
                <span className="text-3xl">📱</span>
              </div>
            </Link>

            <Link
              href="/checkin"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600">
                    Check-in Station
                  </h3>
                  <p className="mt-1 text-gray-600">Scan QR codes for guest check-in</p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
