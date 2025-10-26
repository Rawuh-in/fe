'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock data for QR generation
const MOCK_PARTICIPANTS = [
  { id: 1, name: 'John Doe', eventId: '1' },
  { id: 2, name: 'Jane Smith', eventId: '1' },
  { id: 3, name: 'Bob Johnson', eventId: '2' },
]

const MOCK_EVENTS = [
  { id: '1', name: 'Tech Conference 2025' },
  { id: '2', name: 'Product Launch Event' },
]

const MOCK_ASSIGNMENTS = [
  { id: 1, participantId: 1, type: 'hotel', value: 'Hotel A - Room 101' },
  { id: 2, participantId: 1, type: 'meeting', value: 'Opening Ceremony' },
  { id: 3, participantId: 1, type: 'meeting', value: 'Workshop A' },
  { id: 4, participantId: 2, type: 'hotel', value: 'Hotel B - Room 205' },
  { id: 5, participantId: 2, type: 'meeting', value: 'Opening Ceremony' },
  { id: 6, participantId: 3, type: 'meeting', value: 'Product Demo' },
  { id: 7, participantId: 3, type: 'meeting', value: 'VIP Reception' },
]

interface GeneratedQR {
  id: string
  assignmentId: number
  participantName: string
  assignmentValue: string
  qrData: string
  qrImage: string
  generatedAt: string
}

export default function QRManagementPage() {
  const [selectedEvent, setSelectedEvent] = useState('1')
  const [selectedAssignment, setSelectedAssignment] = useState('')
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([])

  const getParticipantName = (participantId: number) => {
    return MOCK_PARTICIPANTS.find(p => p.id === participantId)?.name || 'Unknown'
  }

  const getAssignmentsForEvent = () => {
    return MOCK_ASSIGNMENTS.filter(assignment => {
      const participant = MOCK_PARTICIPANTS.find(p => p.id === assignment.participantId)
      return participant?.eventId === selectedEvent
    })
  }

  const generateQRCode = (assignmentId: number) => {
    const assignment = MOCK_ASSIGNMENTS.find(a => a.id === assignmentId)
    if (!assignment) return

    const participant = MOCK_PARTICIPANTS.find(p => p.id === assignment.participantId)
    if (!participant) return

    // Generate mock QR data
    const qrData = {
      assignmentId,
      participantId: assignment.participantId,
      token: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    // Create mock QR image (simple colored square for demo)
    const qrImage = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white" stroke="black" stroke-width="2"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <rect x="60" y="60" width="80" height="80" fill="black"/>
        <rect x="80" y="80" width="40" height="40" fill="white"/>
        <text x="100" y="95" text-anchor="middle" fill="black" font-size="8">${assignmentId}</text>
      </svg>
    `)}`

    const newQR: GeneratedQR = {
      id: `qr-${Date.now()}`,
      assignmentId,
      participantName: participant.name,
      assignmentValue: assignment.value,
      qrData: JSON.stringify(qrData),
      qrImage,
      generatedAt: new Date().toLocaleString(),
    }

    setGeneratedQRs(prev => [...prev, newQR])
  }

  const downloadQR = (qr: GeneratedQR) => {
    const link = document.createElement('a')
    link.href = qr.qrImage
    link.download = `QR-${qr.participantName}-${qr.assignmentId}.png`
    link.click()
  }

  const filteredAssignments = getAssignmentsForEvent()

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
            <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
            <p className="mt-2 text-gray-600">Generate and manage QR codes for participant check-in</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Generation */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate QR Codes</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => {
                        setSelectedEvent(e.target.value)
                        setSelectedAssignment('')
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {MOCK_EVENTS.map(event => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Assignment</label>
                    <select
                      value={selectedAssignment}
                      onChange={(e) => setSelectedAssignment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose an assignment...</option>
                      {filteredAssignments.map(assignment => (
                        <option key={assignment.id} value={assignment.id}>
                          {getParticipantName(assignment.participantId)} - {assignment.type}: {assignment.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => selectedAssignment && generateQRCode(parseInt(selectedAssignment))}
                    disabled={!selectedAssignment}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    Generate QR Code
                  </button>
                </div>
              </div>

              {/* Generated QR List */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated QR Codes</h2>

                {generatedQRs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No QR codes generated yet</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedQRs.map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div className="flex items-center space-x-4">
                          <img src={qr.qrImage} alt="QR Code" className="w-16 h-16" />
                          <div>
                            <p className="font-medium text-gray-900">{qr.participantName}</p>
                            <p className="text-sm text-gray-600">{qr.assignmentValue}</p>
                            <p className="text-xs text-gray-500">Generated: {qr.generatedAt}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(qr.qrData)}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition-colors"
                          >
                            Copy Data
                          </button>
                          <button
                            onClick={() => downloadQR(qr)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assignment List */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Assignments</h2>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredAssignments.map((assignment) => {
                  const participantName = getParticipantName(assignment.participantId)
                  const hasGenerated = generatedQRs.some(qr => qr.assignmentId === assignment.id)

                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{participantName}</p>
                        <p className="text-sm text-gray-600 capitalize">{assignment.type}: {assignment.value}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {hasGenerated && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            QR Generated
                          </span>
                        )}
                        <button
                          onClick={() => generateQRCode(assignment.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          {hasGenerated ? 'Regenerate' : 'Generate QR'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredAssignments.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No assignments found for the selected event
                </p>
              )}
            </div>
          </div>

          {/* QR Code Gallery */}
          {generatedQRs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">QR Code Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {generatedQRs.map((qr) => (
                  <div key={qr.id} className="bg-white p-4 rounded-lg shadow-sm border text-center">
                    <img src={qr.qrImage} alt="QR Code" className="w-32 h-32 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">{qr.participantName}</h3>
                    <p className="text-sm text-gray-600 mb-2">{qr.assignmentValue}</p>
                    <button
                      onClick={() => downloadQR(qr)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
