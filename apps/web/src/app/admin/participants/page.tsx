'use client'

import { useState } from 'react'
import Link from 'next/link'

type ParticipantCustomData = Record<string, unknown>

interface Participant {
  id: string
  eventId: string
  userId: string
  data: ParticipantCustomData
  eventName: string
  userName: string
  email?: string
  assignmentsCount: number
}

// Mock data for participants
const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    eventId: '1',
    userId: '1',
    data: {
      company: 'Tech Corp',
      jobTitle: 'Developer',
      dietaryNotes: 'Vegetarian'
    },
    eventName: 'Tech Conference 2025',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    assignmentsCount: 2,
  },
  {
    id: '2',
    eventId: '1',
    userId: '2',
    data: {
      company: 'Design Studio',
      jobTitle: 'Designer'
    },
    eventName: 'Tech Conference 2025',
    userName: 'Jane Smith',
    email: 'jane.smith@example.com',
    assignmentsCount: 1,
  },
  {
    id: '3',
    eventId: '2',
    userId: '3',
    data: {
      vipLevel: 'Gold',
      specialRequests: 'Wheelchair access needed'
    },
    eventName: 'Product Launch Event',
    userName: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    assignmentsCount: 1,
  },
]

const MOCK_EVENTS = [
  { id: '1', name: 'Tech Conference 2025' },
  { id: '2', name: 'Product Launch Event' },
  { id: '3', name: 'Annual Meeting' },
]

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com' },
  { id: '4', name: 'Alice Wilson', email: 'alice.wilson@example.com' },
  { id: '5', name: 'Charlie Brown', email: 'charlie.brown@example.com' },
]

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [formData, setFormData] = useState({
    eventId: '',
    userId: '',
    customData: '',
  })

  const handleCreate = () => {
    let customData: ParticipantCustomData = {}
    try {
      customData = formData.customData ? JSON.parse(formData.customData) : {}
    } catch {
      alert('Invalid JSON format for custom data')
      return
    }

    const selectedEvent = MOCK_EVENTS.find(e => e.id === formData.eventId)
    const selectedUser = MOCK_USERS.find(u => u.id === formData.userId)

    if (!selectedEvent || !selectedUser) {
      alert('Please select both an event and user')
      return
    }

    // Check if user is already a participant in this event
    const existingParticipant = participants.find(p =>
      p.eventId === formData.eventId && p.userId === formData.userId
    )

    if (existingParticipant) {
      alert('This user is already a participant in the selected event')
      return
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      eventId: formData.eventId,
      userId: formData.userId,
      data: customData,
      eventName: selectedEvent.name,
      userName: selectedUser.name,
      email: selectedUser.email,
      assignmentsCount: 0,
    }

    setParticipants([...participants, newParticipant])
    setShowCreateForm(false)
    setFormData({ eventId: '', userId: '', customData: '' })
  }

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setFormData({
      eventId: participant.eventId,
      userId: participant.userId,
      customData: JSON.stringify(participant.data, null, 2),
    })
  }

  const handleUpdate = () => {
    if (!editingParticipant) return

    let customData: ParticipantCustomData = {}
    try {
      customData = formData.customData ? JSON.parse(formData.customData) : {}
    } catch {
      alert('Invalid JSON format for custom data')
      return
    }

    const selectedEvent = MOCK_EVENTS.find(e => e.id === formData.eventId)
    const selectedUser = MOCK_USERS.find(u => u.id === formData.userId)

    if (!selectedEvent || !selectedUser) {
      alert('Please select both an event and user')
      return
    }

    const updatedParticipants = participants.map(participant =>
      participant.id === editingParticipant.id
        ? {
            ...participant,
            eventId: formData.eventId,
            userId: formData.userId,
            data: customData,
            eventName: selectedEvent.name,
            userName: selectedUser.name,
            email: selectedUser.email,
          }
        : participant
    )

    setParticipants(updatedParticipants)
    setEditingParticipant(null)
    setFormData({ eventId: '', userId: '', customData: '' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this participant from the event?')) {
      setParticipants(participants.filter(participant => participant.id !== id))
    }
  }

  const resetForm = () => {
    setShowCreateForm(false)
    setEditingParticipant(null)
    setFormData({ eventId: '', userId: '', customData: '' })
  }

  const renderCustomData = (data: ParticipantCustomData) => {
    if (!data || Object.keys(data).length === 0) return '-'
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ')
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Participants</h1>
              <p className="mt-2 text-gray-600">Add users to events and manage their custom data</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Participant
            </button>
          </div>

          {/* Form Modal */}
          {(showCreateForm || editingParticipant) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Event *</label>
                      <select
                        required
                        value={formData.eventId}
                        onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an event...</option>
                        {MOCK_EVENTS.map(event => (
                          <option key={event.id} value={event.id}>{event.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User *</label>
                      <select
                        required
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a user...</option>
                        {MOCK_USERS.map(user => (
                          <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Custom Data (JSON)</label>
                      <textarea
                        value={formData.customData}
                        onChange={(e) => setFormData({ ...formData, customData: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                        placeholder='{"company": "Tech Corp", "jobTitle": "Developer"}'
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={editingParticipant ? handleUpdate : handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {editingParticipant ? 'Update Participant' : 'Add Participant'}
                      </button>
                      <button
                        onClick={resetForm}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participants Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custom Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{participant.userName}</div>
                      <div className="text-sm text-gray-500">{participant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.eventName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={renderCustomData(participant.data)}>
                        {renderCustomData(participant.data)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {participant.assignmentsCount} assignment{participant.assignmentsCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(participant)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(participant.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {participants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No participants found. Add your first participant above.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
