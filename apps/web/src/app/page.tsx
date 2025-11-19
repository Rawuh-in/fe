'use client';

import Link from 'next/link';
import { useEvents, useUsers, parseEventOptions } from '@event-organizer/services';
import { useAuth } from '../hooks/useAuth';
import { AppShell } from '@/components/layout/app-shell';
import { Skeleton } from '@event-organizer/ui';
import clsx from 'clsx';

function StatCard({ title, value, icon, colorClass, subtext }: {
  title: string;
  value: string | number;
  icon: string;
  colorClass: string;
  subtext?: string;
}) {
  return (
    <div className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border border-[var(--eo-muted)] hover:shadow-[var(--eo-shadow-md)] transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--eo-muted-text)] uppercase tracking-wide">
            {title}
          </p>
          <h3 className={clsx("mt-2 text-3xl font-bold", colorClass)}>
            {value}
          </h3>
          {subtext && <p className="mt-1 text-xs text-[var(--eo-muted-text)]">{subtext}</p>}
        </div>
        <div className={clsx("p-3 rounded-full bg-opacity-10", colorClass.replace('text-', 'bg-'))}>
          <span className={clsx("text-2xl", colorClass)}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--eo-fg)]">
          Event Organizer Dashboard
        </h1>
        <p className="mt-2 text-[var(--eo-muted-text)]">
          Manage events, guests, and check-ins efficiently
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] border border-[var(--eo-muted)]">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Events"
              value={stats.events}
              icon="📅"
              colorClass="text-blue-600"
            />
            <StatCard
              title="Staff Users"
              value={stats.users}
              icon="👥"
              colorClass="text-green-600"
            />
            <StatCard
              title="Guests"
              value={stats.guests}
              icon="🎫"
              colorClass="text-purple-600"
              subtext="Select event to view"
            />
            <StatCard
              title="Assignments"
              value={stats.assignments}
              icon="🏨"
              colorClass="text-orange-600"
              subtext="In guest data"
            />
          </>
        )}
      </div>

      {/* Recent Events */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[var(--eo-fg)]">Recent Events</h2>
        <Link
          href="/admin/events"
          className="bg-[var(--eo-primary)] text-white px-4 py-2 rounded-[var(--eo-radius-md)] hover:opacity-90 transition-opacity"
        >
          Manage Events
        </Link>
      </div>

      <div className="bg-[var(--eo-bg-elevated)] shadow-[var(--eo-shadow-sm)] overflow-hidden rounded-[var(--eo-radius-lg)] border border-[var(--eo-muted)]">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-[250px]" />
                  <Skeleton className="h-4 w-[350px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (eventsData?.data || eventsData?.Data) &&
          ((eventsData?.data?.length ?? 0) || (eventsData?.Data?.length ?? 0)) > 0 ? (
          <ul className="divide-y divide-[var(--eo-muted)]">
            {(eventsData.data || eventsData.Data || []).map((event, index) => {
              const options = parseEventOptions(
                event.options || event.Options || '{}'
              );
              return (
                <li key={event.eventID || event.ID || index} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-[var(--eo-fg)]">
                            {event.eventName || event.EventName}
                          </h3>
                          <p className="text-sm text-[var(--eo-muted-text)]">
                            {event.description ||
                              event.Description ||
                              'No description'}
                          </p>
                          <div className="mt-2 flex space-x-4 text-sm text-[var(--eo-muted-text)]">
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
                        className="bg-purple-600 text-white px-3 py-1 rounded-[var(--eo-radius-sm)] text-sm hover:bg-purple-700 transition-colors"
                      >
                        Guest Management
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8 text-[var(--eo-muted-text)]">
            No events found. Create your first event!
          </div>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Link
          href="/admin/events"
          className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border border-[var(--eo-muted)] hover:shadow-[var(--eo-shadow-md)] transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--eo-fg)] group-hover:text-[var(--eo-primary)]">
                Manage Events
              </h3>
              <p className="mt-1 text-[var(--eo-muted-text)]">
                Create and configure events with hotels/rooms
              </p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border border-[var(--eo-muted)] hover:shadow-[var(--eo-shadow-md)] transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--eo-fg)] group-hover:text-green-600">
                Manage Staff Users
              </h3>
              <p className="mt-1 text-[var(--eo-muted-text)]">
                Add system administrators and staff
              </p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </Link>

        <Link
          href="/admin/guests"
          className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border border-[var(--eo-muted)] hover:shadow-[var(--eo-shadow-md)] transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--eo-fg)] group-hover:text-purple-600">
                Guest Management
              </h3>
              <p className="mt-1 text-[var(--eo-muted-text)]">
                Manage guests, assignments, and QR codes
              </p>
            </div>
            <span className="text-3xl">🎫</span>
          </div>
        </Link>

        <Link
          href="/checkin"
          className="bg-[var(--eo-bg-elevated)] p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border-2 border-teal-200 hover:shadow-[var(--eo-shadow-md)] transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--eo-fg)] group-hover:text-teal-600">
                QR Check-in Station
              </h3>
              <p className="mt-1 text-[var(--eo-muted-text)]">Scan QR codes for guest check-in</p>
            </div>
            <span className="text-3xl">✅</span>
          </div>
        </Link>

        <Link
          href="/checkout"
          className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-[var(--eo-radius-lg)] shadow-[var(--eo-shadow-sm)] border-2 border-orange-300 hover:shadow-[var(--eo-shadow-md)] transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--eo-fg)] group-hover:text-orange-600">
                QR Check-out Station
              </h3>
              <p className="mt-1 text-[var(--eo-muted-text)]">Scan QR codes for guest check-out</p>
            </div>
            <span className="text-3xl">🚪</span>
          </div>
        </Link>
      </div>
    </AppShell>
  );
}
