1.⁠ ⁠Peserta input data diri / dari database
2.⁠ ⁠Generate unique QR code untuk masing masing peserta
3.⁠ ⁠QR dikirim melalui WhatsApp Blast/Email
•⁠  ⁠WA dari kita
•⁠  ⁠WA dr client (ini gimana cara connectnya)
4.⁠ ⁠Di venue, peserta scan QR, masuk ke record timestamp dia datengnya
5.⁠ ⁠Ke record siapa yg belum datang/sudah

User Management

- User Admin can Add/Create User with unique event_id
- User Admin can add or delete column on each event table
- User Admin can fetch user data
- User Admin can asign data to user
- With each column created, the admin can input the data
- Make option for each column data / make input base on column
- Generate QR for Check-in for each column
- Generate WA Template for each column
- When Scanned, input to DB with timestamp
- Add report/list who haven’t come yet by event or by check-in

### 1. Events

```sql
events (
  id UUID PK,
  name TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  schema JSONB  -- custom fields
)
```

### 2. Users (core user info)

```sql
users (
  id UUID PK,
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT
)
```

### 3. Event Participants

```sql
event_participants (
  id SERIAL PK,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES users(id),
  data JSONB  -- dynamic per-event info (e.g., company, notes, etc.)
)
```

### 4. Assignments (user ↔ hotel/meeting/room)

```sql
event_assignments (
  id SERIAL PK,
  event_id UUID REFERENCES events(id),
  participant_id INT REFERENCES event_participants(id),
  assignment_type TEXT,  -- "hotel" | "meeting" | "room"
  assignment_value TEXT, -- e.g., "Hotel A" or "Meeting 1"
  checkin_status TEXT,   -- not_coming | checked_in | checked_out
  checkin_timestamp TIMESTAMP,
  checkout_timestamp TIMESTAMP
)
```

### 5. Options (dropdown values)

```sql
event_options (
  id SERIAL PK,
  event_id UUID,
  column_name TEXT,   -- e.g. "hotel"
  option_value TEXT   -- e.g. "Hotel A"
)
```

## 🔹 How This Works

1. **User joins event** → `event_participants` row created.
2. **Admin assigns user to multiple things** → `event_assignments` rows created:
    - `hotel = Hotel A`
    - `hotel = Hotel B`
    - `meeting = Meeting 1`
    - `meeting = Meeting 2`
3. **Check-in/out is tracked per assignment** → you can check them into Hotel A at 9 AM, then into Hotel B at 1 PM, etc.
4. **Reports are simple**:
- Who’s in Hotel A now?

```sql
SELECT u.name, ea.checkin_status, ea.checkin_timestamp
FROM event_assignments ea
JOIN event_participants ep ON ea.participant_id = ep.id
JOIN users u ON ep.user_id = u.id
WHERE ea.event_id = 'E1' AND ea.assignment_type = 'hotel' AND ea.assignment_value = 'Hotel A';
```

- Who hasn’t come to Meeting 1?

```sql
SELECT u.name
FROM event_assignments ea
JOIN event_participants ep ON ea.participant_id = ep.id
JOIN users u ON ep.user_id = u.id
WHERE ea.event_id = 'E1'
  AND ea.assignment_type = 'meeting'
  AND ea.assignment_value = 'Meeting 1'
  AND ea.checkin_status = 'not_coming';
```

![ChatGPT Image Sep 30, 2025 at 09_44_07 AM.png](attachment:c9a84123-9f89-4152-ab1e-a54ea0a21b17:ChatGPT_Image_Sep_30_2025_at_09_44_07_AM.png)