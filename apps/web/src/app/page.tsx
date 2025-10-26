'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock data
const MOCK_STATS = {
  events: 5,
  users: 127,
  participants: 89,
  assignments: 156,
}

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Tech Conference 2025',
    startDate: '2025-03-15',
    endDate: '2025-03-17',
    participants: 45,
    assignments: 78,
    options: 12,
  },
  {
    id: '2',
    name: 'Product Launch Event',
    startDate: '2025-04-20',
    endDate: '2025-04-20',
    participants: 23,
    assignments: 34,
    options: 5,
  },
  {
    id: '3',
    name: 'Annual Meeting',
    startDate: '2025-05-10',
    endDate: '2025-05-12',
    participants: 21,
    assignments: 44,
    options: 8,
  },
]

export default function Dashboard() {
  const [showEventModal, setShowEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    startDate: '',
    endDate: '',
  })

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    console.log('Creating event:', newEvent)
    setShowEventModal(false)
    setNewEvent({ name: '', startDate: '', endDate: '' })
  }

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
                <Link href="/" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/events" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Events
                </Link>
                <Link href="/admin/users" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Users
                </Link>
                <Link href="/checkin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Check-in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Event Organizer Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage events, participants, and check-ins efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📅</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Events</h3>
                  <p className="text-3xl font-bold text-blue-600">{MOCK_STATS.events}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Users</h3>
                  <p className="text-3xl font-bold text-green-600">{MOCK_STATS.users}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🎫</span>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Participants</h3>
                  <p className="text-3xl font-bold text-purple-600">{MOCK_STATS.participants}</p>
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
                  <p className="text-3xl font-bold text-orange-600">{MOCK_STATS.assignments}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Event
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {MOCK_EVENTS.map((event) => (
                <li key={event.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{event.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                            <span>{event.participants} participants</span>
                            <span>{event.assignments} assignments</span>
                            <span>{event.options} options</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/admin/participants?eventId=${event.id}`}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Manage Participants
                      </Link>
                      <Link
                        href={`/admin/assignments?eventId=${event.id}`}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                      >
                        Manage Assignments
                      </Link>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Link
              href="/admin/events"
              className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">Manage Events</h3>
                  <p className="mt-1 text-gray-600">Create and configure events with custom fields</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600">Manage Users</h3>
                  <p className="mt-1 text-gray-600">Add and manage user profiles</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600">Manage Participants</h3>
                  <p className="mt-1 text-gray-600">Add users to events with custom data</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600">Manage Assignments</h3>
                  <p className="mt-1 text-gray-600">Assign hotels, meetings, and rooms</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">QR Code Management</h3>
                  <p className="mt-1 text-gray-600">Generate and manage QR codes</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600">Check-in Station</h3>
                  <p className="mt-1 text-gray-600">Scan QR codes for check-in/out</p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {showEventModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Name</label>
                  <input
                    type="text"
                    required
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
