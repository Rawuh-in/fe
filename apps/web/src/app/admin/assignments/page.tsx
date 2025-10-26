'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Assignment {
  id: string
  eventId: string
  participantId: string
  assignmentType: 'hotel' | 'meeting' | 'room'
  assignmentValue: string
  checkinStatus: 'not_coming' | 'checked_in' | 'checked_out'
  checkinTimestamp?: string
  checkoutTimestamp?: string
  participantName: string
  eventName: string
}

// Mock data for assignments
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    eventId: '1',
    participantId: '1',
    assignmentType: 'hotel',
    assignmentValue: 'Hotel A - Room 101',
    checkinStatus: 'not_coming',
    checkinTimestamp: undefined,
    checkoutTimestamp: undefined,
    participantName: 'John Doe',
    eventName: 'Tech Conference 2025',
  },
  {
    id: '2',
    eventId: '1',
    participantId: '1',
    assignmentType: 'meeting',
    assignmentValue: 'Opening Ceremony',
    checkinStatus: 'not_coming',
    checkinTimestamp: undefined,
    checkoutTimestamp: undefined,
    participantName: 'John Doe',
    eventName: 'Tech Conference 2025',
  },
  {
    id: '3',
    eventId: '1',
    participantId: '1',
    assignmentType: 'meeting',
    assignmentValue: 'Workshop A',
    checkinStatus: 'checked_in',
    checkinTimestamp: '2025-01-15 09:30:00',
    checkoutTimestamp: undefined,
    participantName: 'John Doe',
    eventName: 'Tech Conference 2025',
  },
  {
    id: '4',
    eventId: '1',
    participantId: '2',
    assignmentType: 'hotel',
    assignmentValue: 'Hotel B - Room 205',
    checkinStatus: 'checked_in',
    checkinTimestamp: '2025-01-15 08:15:00',
    checkoutTimestamp: undefined,
    participantName: 'Jane Smith',
    eventName: 'Tech Conference 2025',
  },
  {
    id: '5',
    eventId: '1',
    participantId: '2',
    assignmentType: 'meeting',
    assignmentValue: 'Opening Ceremony',
    checkinStatus: 'not_coming',
    checkinTimestamp: undefined,
    checkoutTimestamp: undefined,
    participantName: 'Jane Smith',
    eventName: 'Tech Conference 2025',
  },
  {
    id: '6',
    eventId: '2',
    participantId: '3',
    assignmentType: 'meeting',
    assignmentValue: 'Product Demo',
    checkinStatus: 'not_coming',
    checkinTimestamp: undefined,
    checkoutTimestamp: undefined,
    participantName: 'Bob Johnson',
    eventName: 'Product Launch Event',
  },
  {
    id: '7',
    eventId: '2',
    participantId: '3',
    assignmentType: 'meeting',
    assignmentValue: 'VIP Reception',
    checkinStatus: 'checked_out',
    checkinTimestamp: '2025-01-15 17:45:00',
    checkoutTimestamp: '2025-01-15 19:30:00',
    participantName: 'Bob Johnson',
    eventName: 'Product Launch Event',
  },
]

const MOCK_EVENTS = [
  { id: '1', name: 'Tech Conference 2025' },
  { id: '2', name: 'Product Launch Event' },
  { id: '3', name: 'Annual Meeting' },
]

const MOCK_PARTICIPANTS = [
  { id: '1', name: 'John Doe', eventId: '1' },
  { id: '2', name: 'Jane Smith', eventId: '1' },
  { id: '3', name: 'Bob Johnson', eventId: '2' },
]

// Mock assignment options
const ASSIGNMENT_OPTIONS = {
  hotel: ['Hotel A - Room 101', 'Hotel A - Room 102', 'Hotel B - Room 205', 'Hotel C - Suite 301'],
  meeting: ['Opening Ceremony', 'Workshop A', 'Workshop B', 'Keynote Speech', 'Product Demo', 'VIP Reception'],
  room: ['Meeting Room A', 'Meeting Room B', 'Auditorium', 'Conference Hall'],
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [formData, setFormData] = useState({
    eventId: '',
    participantId: '',
    assignmentType: '' as Assignment['assignmentType'],
    assignmentValue: '',
  })

  const handleCreate = () => {
    if (!formData.eventId || !formData.participantId || !formData.assignmentType || !formData.assignmentValue) {
      alert('Please fill in all fields')
      return
    }

    const selectedEvent = MOCK_EVENTS.find(e => e.id === formData.eventId)
    const selectedParticipant = MOCK_PARTICIPANTS.find(p => p.id === formData.participantId)

    if (!selectedEvent || !selectedParticipant) {
      alert('Invalid event or participant selection')
      return
    }

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      eventId: formData.eventId,
      participantId: formData.participantId,
      assignmentType: formData.assignmentType,
      assignmentValue: formData.assignmentValue,
      checkinStatus: 'not_coming',
      checkinTimestamp: undefined,
      checkoutTimestamp: undefined,
      participantName: selectedParticipant.name,
      eventName: selectedEvent.name,
    }

    setAssignments([...assignments, newAssignment])
    setShowCreateForm(false)
    setFormData({ eventId: '', participantId: '', assignmentType: '' as any, assignmentValue: '' })
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      eventId: assignment.eventId,
      participantId: assignment.participantId,
      assignmentType: assignment.assignmentType,
      assignmentValue: assignment.assignmentValue,
    })
  }

  const handleUpdate = () => {
    if (!editingAssignment) return

    if (!formData.eventId || !formData.participantId || !formData.assignmentType || !formData.assignmentValue) {
      alert('Please fill in all fields')
      return
    }

    const selectedEvent = MOCK_EVENTS.find(e => e.id === formData.eventId)
    const selectedParticipant = MOCK_PARTICIPANTS.find(p => p.id === formData.participantId)

    if (!selectedEvent || !selectedParticipant) {
      alert('Invalid event or participant selection')
      return
    }

    const updatedAssignments = assignments.map(assignment =>
      assignment.id === editingAssignment.id
        ? {
            ...assignment,
            eventId: formData.eventId,
            participantId: formData.participantId,
            assignmentType: formData.assignmentType,
            assignmentValue: formData.assignmentValue,
            participantName: selectedParticipant.name,
            eventName: selectedEvent.name,
          }
        : assignment
    )

    setAssignments(updatedAssignments)
    setEditingAssignment(null)
    setFormData({ eventId: '', participantId: '', assignmentType: '' as any, assignmentValue: '' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(assignment => assignment.id !== id))
    }
  }

  const handleCheckIn = (id: string) => {
    setAssignments(prev => prev.map(assignment =>
      assignment.id === id
        ? {
            ...assignment,
            checkinStatus: 'checked_in',
            checkinTimestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          }
        : assignment
    ))
  }

  const handleCheckOut = (id: string) => {
    setAssignments(prev => prev.map(assignment =>
      assignment.id === id
        ? {
            ...assignment,
            checkinStatus: 'checked_out',
            checkoutTimestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
          }
        : assignment
    ))
  }

  const resetForm = () => {
    setShowCreateForm(false)
    setEditingAssignment(null)
    setFormData({ eventId: '', participantId: '', assignmentType: '' as any, assignmentValue: '' })
  }

  const getFilteredParticipants = (eventId: string) => {
    return MOCK_PARTICIPANTS.filter(p => p.eventId === eventId)
  }

  const getStatusBadgeClass = (status: Assignment['checkinStatus']) => {
    switch (status) {
      case 'checked_in': return 'bg-green-100 text-green-800'
      case 'checked_out': return 'bg-blue-100 text-blue-800'
      case 'not_coming': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Assignment['checkinStatus']) => {
    switch (status) {
      case 'checked_in': return 'Checked In'
      case 'checked_out': return 'Checked Out'
      case 'not_coming': return 'Not Coming'
      default: return status
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Assignments</h1>
              <p className="mt-2 text-gray-600">Assign hotels, meetings, and rooms to participants</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Assignment
            </button>
          </div>

          {/* Form Modal */}
          {(showCreateForm || editingAssignment) && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Event *</label>
                      <select
                        required
                        value={formData.eventId}
                        onChange={(e) => {
                          setFormData({ ...formData, eventId: e.target.value, participantId: '' })
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an event...</option>
                        {MOCK_EVENTS.map(event => (
                          <option key={event.id} value={event.id}>{event.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Participant *</label>
                      <select
                        required
                        value={formData.participantId}
                        onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                        disabled={!formData.eventId}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select a participant...</option>
                        {formData.eventId && getFilteredParticipants(formData.eventId).map(participant => (
                          <option key={participant.id} value={participant.id}>{participant.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assignment Type *</label>
                      <select
                        required
                        value={formData.assignmentType}
                        onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value as any, assignmentValue: '' })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select type...</option>
                        <option value="hotel">Hotel</option>
                        <option value="meeting">Meeting</option>
                        <option value="room">Room</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assignment Value *</label>
                      <select
                        required
                        value={formData.assignmentValue}
                        onChange={(e) => setFormData({ ...formData, assignmentValue: e.target.value })}
                        disabled={!formData.assignmentType}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select value...</option>
                        {formData.assignmentType && ASSIGNMENT_OPTIONS[formData.assignmentType]?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={editingAssignment ? handleUpdate : handleCreate}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
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

          {/* Assignments Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.participantName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.eventName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {assignment.assignmentType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={assignment.assignmentValue}>
                        {assignment.assignmentValue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(assignment.checkinStatus)}`}>
                        {getStatusText(assignment.checkinStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(assignment.checkoutTimestamp || assignment.checkinTimestamp) ? (
                        <div className="text-xs">
                          {assignment.checkoutTimestamp && <div>Out: {assignment.checkoutTimestamp}</div>}
                          {assignment.checkinTimestamp && !assignment.checkoutTimestamp && <div>In: {assignment.checkinTimestamp}</div>}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {assignment.checkinStatus === 'not_coming' && (
                        <button
                          onClick={() => handleCheckIn(assignment.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Check In
                        </button>
                      )}
                      {assignment.checkinStatus === 'checked_in' && (
                        <button
                          onClick={() => handleCheckOut(assignment.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Check Out
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assignments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assignments found. Create your first assignment above.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
