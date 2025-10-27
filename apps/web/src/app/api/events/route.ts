import { NextRequest, NextResponse } from 'next/server';

interface EventRecord {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  schema?: unknown;
  createdAt: string;
  counts: {
    participants: number;
    assignments: number;
    options: number;
  };
}

interface EventStore {
  events: EventRecord[];
}

const globalForEvents = globalThis as typeof globalThis & {
  __eventStore?: EventStore;
};

const bootstrapStore = (): EventStore => ({
  events: [
    {
      id: '1',
      name: 'Tech Conference 2025',
      startDate: '2025-03-15',
      endDate: '2025-03-17',
      createdAt: new Date('2024-12-01T10:00:00.000Z').toISOString(),
      counts: {
        participants: 45,
        assignments: 78,
        options: 12,
      },
    },
    {
      id: '2',
      name: 'Product Launch Event',
      startDate: '2025-04-20',
      endDate: '2025-04-20',
      createdAt: new Date('2024-12-10T10:00:00.000Z').toISOString(),
      counts: {
        participants: 23,
        assignments: 34,
        options: 5,
      },
    },
    {
      id: '3',
      name: 'Annual Meeting',
      startDate: '2025-05-10',
      endDate: '2025-05-12',
      createdAt: new Date('2024-12-15T10:00:00.000Z').toISOString(),
      counts: {
        participants: 21,
        assignments: 44,
        options: 8,
      },
    },
  ],
});

const getStore = (): EventStore => {
  if (!globalForEvents.__eventStore) {
    globalForEvents.__eventStore = bootstrapStore();
  }

  return globalForEvents.__eventStore;
};

const serialize = (event: EventRecord) => ({
  id: event.id,
  name: event.name,
  startDate: event.startDate,
  endDate: event.endDate,
  schema: event.schema,
  createdAt: event.createdAt,
  _count: {
    participants: event.counts.participants,
    assignments: event.counts.assignments,
    options: event.counts.options,
  },
});

// GET /api/events - Get all events
export async function GET() {
  const store = getStore();
  const events = [...store.events]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(serialize);

  return NextResponse.json(events);
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, schema } = body ?? {};

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date, and end date are required' },
        { status: 400 }
      );
    }

    const store = getStore();
    const newEvent: EventRecord = {
      id: crypto.randomUUID(),
      name,
      startDate,
      endDate,
      schema,
      createdAt: new Date().toISOString(),
      counts: {
        participants: 0,
        assignments: 0,
        options: 0,
      },
    };

    store.events.push(newEvent);

    return NextResponse.json(serialize(newEvent), { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
