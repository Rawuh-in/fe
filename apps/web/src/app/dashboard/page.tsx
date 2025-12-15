'use client';

import Link from 'next/link';
import {
  useEvents,
  useUsers,
  parseEventOptions,
  type Event,
} from '@event-organizer/services';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '@event-organizer/ui';

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { data: eventsData, isLoading: eventsLoading } = useEvents({
    limit: 10,
    sort: 'created_at',
    dir: 'desc',
  });
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

  // Calculate statistics from real data (handle both field naming conventions)
  const stats = {
    events:
      eventsData?.pagination?.totalRows ||
      eventsData?.Pagination?.TotalData ||
      eventsData?.pagination?.TotalData ||
      eventsData?.data?.length ||
      0,
    users:
      usersData?.pagination?.totalRows ||
      usersData?.Pagination?.TotalData ||
      usersData?.pagination?.TotalData ||
      usersData?.data?.length ||
      0,
    // Note: Guests count would need to aggregate across all events
    // For now, we'll show a placeholder
    guests: '—',
    assignments: '—',
  };

  const isLoading = eventsLoading || usersLoading;

  const dashboardLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Guest Site', href: '/guest' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        links={dashboardLinks}
        action={
          <button
            className="flex items-center justify-center gap-2 bg-[#2E3192] text-white rounded-lg hover:bg-[#2f2f7a] transition-colors px-5 py-2.5 text-sm font-[590]"
            style={{ fontFamily: 'SF Pro, sans-serif' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                fill="currentColor"
              />
            </svg>
            Name A
          </button>
        }
      />

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
                  <p className="text-3xl font-bold text-purple-600">{stats.guests}</p>
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
            ) : (eventsData?.data || eventsData?.Data) &&
              ((eventsData?.data?.length ?? 0) || (eventsData?.Data?.length ?? 0)) > 0 ? (
              <ul className="divide-y divide-gray-200">
                {(eventsData.data || eventsData.Data || []).map(
                  (event: Event, index: number) => {
                    const options = parseEventOptions(
                      event.options || event.Options || '{}'
                    );
                    return (
                      <li key={event.eventID || event.ID || index} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {event.eventName || event.EventName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {event.description ||
                                    event.Description ||
                                    'No description'}
                                </p>
                                <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                                  <span>{options.Hotels?.length || 0} hotels</span>
                                  <span>{options.Rooms?.length || 0} rooms</span>
                                  <span>
                                    Created{' '}
                                    {event.createdAt || event.CreatedAt
                                      ? new Date(
                                          (event.createdAt || event.CreatedAt)!
                                        ).toLocaleDateString()
                                      : '-'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <Link
                              href={`/admin/guests`}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                            >
                              Guest Management
                            </Link>
                          </div>
                        </div>
                      </li>
                    );
                  }
                )}
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
                  <p className="mt-1 text-gray-600">
                    Add system administrators and staff
                  </p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
            </Link>

            <Link
              href="/admin/guests"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">
                    Guest Management
                  </h3>
                  <p className="mt-1 text-gray-600">
                    Manage guests, assignments, and QR codes
                  </p>
                </div>
                <span className="text-3xl">🎫</span>
              </div>
            </Link>

            <Link
              href="/checkin"
              className="bg-white p-6 rounded-lg shadow-sm border-2 border-teal-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600">
                    QR Check-in Station
                  </h3>
                  <p className="mt-1 text-gray-600">Scan QR codes for guest check-in</p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </Link>

            <Link
              href="/checkout"
              className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg shadow-sm border-2 border-orange-300 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">
                    QR Check-out Station
                  </h3>
                  <p className="mt-1 text-gray-600">Scan QR codes for guest check-out</p>
                </div>
                <span className="text-3xl">🚪</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
