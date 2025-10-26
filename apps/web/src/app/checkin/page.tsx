'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// Mock data for participants and assignments
const MOCK_PARTICIPANTS = [
  {
    id: 1,
    name: 'John Doe',
    event: 'Tech Conference 2025',
    assignments: [
      { id: 1, type: 'hotel', value: 'Hotel A - Room 101', status: 'not_coming', checkinTime: null },
      { id: 2, type: 'meeting', value: 'Opening Ceremony', status: 'not_coming', checkinTime: null },
      { id: 3, type: 'meeting', value: 'Workshop A', status: 'checked_in', checkinTime: '2025-01-15 09:30:00' },
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    event: 'Tech Conference 2025',
    assignments: [
      { id: 4, type: 'hotel', value: 'Hotel B - Room 205', status: 'checked_in', checkinTime: '2025-01-15 08:15:00' },
      { id: 5, type: 'meeting', value: 'Opening Ceremony', status: 'not_coming', checkinTime: null },
    ]
  },
  {
    id: 3,
    name: 'Bob Johnson',
    event: 'Product Launch Event',
    assignments: [
      { id: 6, type: 'meeting', value: 'Product Demo', status: 'not_coming', checkinTime: null },
      { id: 7, type: 'meeting', value: 'VIP Reception', status: 'checked_out', checkinTime: '2025-01-15 17:45:00' },
    ]
  },
]

const MOCK_ASSIGNMENTS = [
  ...MOCK_PARTICIPANTS[0].assignments,
  ...MOCK_PARTICIPANTS[1].assignments,
  ...MOCK_PARTICIPANTS[2].assignments,
].map(assignment => ({
  id: assignment.id,
  participantName: MOCK_PARTICIPANTS.find(p => p.assignments.some(a => a.id === assignment.id))?.name || 'Unknown',
  eventName: MOCK_PARTICIPANTS.find(p => p.assignments.some(a => a.id === assignment.id))?.event || 'Unknown',
  ...assignment,
}))

export default function CheckInPage() {
  const [selectedEvent, setSelectedEvent] = useState('Tech Conference 2025')
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual')
  const [manualCode, setManualCode] = useState('')
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<any>(null)
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleManualScan = () => {
    // Simulate scanning assignment IDs
    const assignmentId = parseInt(manualCode)
    const assignment = assignments.find(a => a.id === assignmentId)

    if (assignment) {
      // Simulate check-in
      setAssignments(prev => prev.map(a =>
        a.id === assignmentId
          ? { ...a, status: 'checked_in', checkinTime: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : a
      ))

      setLastScanned({
        ...assignment,
        participantName: assignment.participantName,
        value: assignment.value,
        status: 'checked_in',
        checkinTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      })

      setScanResult(`✅ Successfully checked in ${assignment.participantName} for ${assignment.value}`)
    } else {
      setScanResult(`❌ Assignment not found with ID: ${manualCode}`)
    }

    setManualCode('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate QR code processing
      const reader = new FileReader()
      reader.onload = () => {
        // Mock QR code data processing
        const mockQrData = `{"assignmentId": 1, "token": "mock-token-${Date.now()}"}`

        try {
          const parsed = JSON.parse(mockQrData)
          const assignment = assignments.find(a => a.id === parsed.assignmentId)

          if (assignment) {
            setAssignments(prev => prev.map(a =>
              a.id === parsed.assignmentId
                ? { ...a, status: 'checked_in', checkinTime: new Date().toISOString().slice(0, 19).replace('T', ' ') }
                : a
            ))

            setLastScanned({
              ...assignment,
              status: 'checked_in',
              checkinTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
            })

            setScanResult(`✅ QR Code scanned: ${assignment.participantName} checked in for ${assignment.value}`)
          } else {
            setScanResult(`❌ Invalid QR code - assignment not found`)
          }
        } catch {
          setScanResult(`❌ Invalid QR code format`)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'checked_in': return 'bg-green-100 text-green-800'
      case 'checked_out': return 'bg-blue-100 text-blue-800'
      case 'not_coming': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredAssignments = assignments.filter(a => a.eventName === selectedEvent)

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
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Check-in Station</h1>
            <p className="mt-2 text-gray-600">Scan QR codes or enter assignment IDs to check in participants</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scan Section */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Options</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Tech Conference 2025">Tech Conference 2025</option>
                    <option value="Product Launch Event">Product Launch Event</option>
                    <option value="Annual Meeting">Annual Meeting</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Manual Entry</h3>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter assignment ID (1-7)"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleManualScan}
                        disabled={!manualCode}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      >
                        Check In
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">QR Code Scanner</h3>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>📷 Upload QR Code Image</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Upload a QR code image to simulate scanning</p>
                  </div>
                </div>

                {scanResult && (
                  <div className={`mt-4 p-3 rounded-md ${scanResult.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {scanResult}
                  </div>
                )}

                {lastScanned && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <h4 className="font-medium text-blue-900">Last Scanned</h4>
                    <p className="text-blue-800">{lastScanned.participantName}</p>
                    <p className="text-blue-700">{lastScanned.value}</p>
                    <p className="text-blue-600 text-sm">{lastScanned.checkinTime}</p>
                  </div>
                )}
              </div>

              {/* Status Summary */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredAssignments.filter(a => a.status === 'checked_in').length}
                    </div>
                    <div className="text-sm text-gray-500">Checked In</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredAssignments.filter(a => a.status === 'checked_out').length}
                    </div>
                    <div className="text-sm text-gray-500">Checked Out</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {filteredAssignments.filter(a => a.status === 'not_coming').length}
                    </div>
                    <div className="text-sm text-gray-500">Not Coming</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Assignments</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{assignment.participantName}</p>
                          <p className="text-sm text-gray-600 capitalize">{assignment.type}: {assignment.value}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(assignment.status)}`}
                        >
                          {assignment.status.replace('_', ' ')}
                        </span>
                      </div>
                      {assignment.checkinTime && (
                        <p className="text-xs text-gray-500 mt-1">{assignment.checkinTime}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredAssignments.length === 0 && (
                <p className="text-gray-500 text-center py-8">No assignments found for this event.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
