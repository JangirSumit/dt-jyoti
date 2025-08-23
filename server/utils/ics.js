function pad2(n) { return String(n).padStart(2, '0'); }
function toICSDate(dt) {
  return (
    dt.getUTCFullYear().toString() +
    pad2(dt.getUTCMonth() + 1) +
    pad2(dt.getUTCDate()) +
    'T' +
    pad2(dt.getUTCHours()) +
    pad2(dt.getUTCMinutes()) +
    pad2(dt.getUTCSeconds()) + 'Z'
  );
}

function createInvite({ uid, start, end, summary, description, location, organizerEmail, attendeeEmail }) {
  const dtStamp = toICSDate(new Date());
  const dtStart = toICSDate(start);
  const dtEnd = toICSDate(end);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
  'PRODID:-//gonutrimind//Appointments//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : 'LOCATION:Online',
    organizerEmail ? `ORGANIZER:mailto:${organizerEmail}` : '',
    attendeeEmail ? `ATTENDEE;RSVP=TRUE:mailto:${attendeeEmail}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean);
  return lines.join('\r\n');
}

module.exports = { createInvite };
