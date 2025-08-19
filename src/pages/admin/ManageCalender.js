import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Switch, // ADD
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import { alpha } from '@mui/material/styles';

function ymd(d) {
  const dt = new Date(d);
  const m = `${dt.getMonth() + 1}`.padStart(2, '0');
  const day = `${dt.getDate()}`.padStart(2, '0');
  return `${dt.getFullYear()}-${m}-${day}`;
}
function firstOfMonth(d) {
  const dt = new Date(d);
  dt.setDate(1);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
function lastOfMonth(d) {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + 1, 0);
  dt.setHours(0, 0, 0, 0);
  return dt;
}
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Replace DEFAULT_SLOT_OPTIONS to match server
const DEFAULT_SLOT_OPTIONS = [
  '10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM',
  '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'
];

export default function ManageCalendar() {
  const [monthDate, setMonthDate] = useState(firstOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({}); // { 'YYYY-MM-DD': number }
  const [bookedTimes, setBookedTimes] = useState({});     // { dateStr: string[] }
  const [dayBooked, setDayBooked] = useState(new Set());  // booked slots in dialog
  const [holidays, setHolidays] = useState({});           // { dateStr: boolean }  // ADD
  const abortRef = useRef(null);

  // Day details dialog
  const [openDay, setOpenDay] = useState(null);
  const [daySlots, setDaySlots] = useState(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isPastDay, setIsPastDay] = useState(false); // ADD

  // NEW: editable selection and options
  const [slotOptions, setSlotOptions] = useState(DEFAULT_SLOT_OPTIONS);
  const [editSlots, setEditSlots] = useState(new Set());
  const [saving, setSaving] = useState(false);

  const isSmDown = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const monthMeta = useMemo(() => {
    const first = firstOfMonth(monthDate);
    const last = lastOfMonth(monthDate);
    const daysInMonth = last.getDate();
    const leadingBlanks = first.getDay(); // 0=Sun
    const totalCells = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
    const todayStr = ymd(new Date());
    const matrix = Array.from({ length: totalCells }, (_, idx) => {
      const dayNum = idx - leadingBlanks + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return { dateStr: null, label: '' };
      const date = new Date(first);
      date.setDate(dayNum);
      const dateStr = ymd(date);
      return {
        dateStr,
        label: String(dayNum),
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr, // ADD: mark past days
      };
    });
    return { first, last, leadingBlanks, daysInMonth, matrix };
  }, [monthDate]);

  const loadMonth = async () => {
    try {
      setLoading(true);
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const dates = [];
      for (let d = 1; d <= monthMeta.daysInMonth; d++) {
        const dt = new Date(monthMeta.first);
        dt.setDate(d);
        dates.push(ymd(dt));
      }

      const results = await Promise.all(
        dates.map(async (d) => {
          try {
            const res = await fetch(`/api/appointments/slots?date=${encodeURIComponent(d)}`, { signal: ac.signal });
            if (!res.ok) throw new Error('Bad response');
            const data = await res.json();
            const booked = Array.isArray(data.booked) ? data.booked : [];
            const available = Array.isArray(data.slots) ? data.slots : [];
            return [d, { booked, available }];
          } catch {
            return [d, { booked: [], available: [] }];
          }
        })
      );

      const countsMap = {};
      const bookedMap = {};
      const holidayMap = {};
      results.forEach(([d, { booked, available }]) => {
        countsMap[d] = booked.length;
        bookedMap[d] = booked;
        holidayMap[d] = (available.length === 0);
      });
      setCounts(countsMap);
      setBookedTimes(bookedMap);
      setHolidays(holidayMap); // ADD
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonth();
    // cleanup abort on unmount
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthDate]);

  const openDayDialog = async (dateStr) => {
    setOpenDay(dateStr);
    // mark past day (keeps dialog clickable, but disables editing)
    setIsPastDay(dateStr < ymd(new Date())); // ADD
    setDayLoading(true);
    try {
      const res = await fetch(`/api/appointments/slots?date=${encodeURIComponent(dateStr)}`);
      const data = await res.json();
      const available = Array.isArray(data.slots) ? data.slots : [];
      const booked = Array.isArray(data.booked) ? data.booked : [];
      setDaySlots(available);
      setEditSlots(new Set(available));
      setDayBooked(new Set(booked));
      setIsHoliday(available.length === 0);

      // fetch slot options
      try {
        const optRes = await fetch('/api/appointments/slot-options');
        if (optRes.ok) {
          const optData = await optRes.json();
          if (Array.isArray(optData.slots) && optData.slots.length) {
            setSlotOptions(optData.slots);
          }
        }
      } catch { /* ignore */ }
    } catch {
      setDaySlots([]);
      setEditSlots(new Set());
      setDayBooked(new Set());
      setIsHoliday(true);
    } finally {
      setDayLoading(false);
    }
  };

  const toggleSlot = (slot) =>
    setEditSlots((prev) => {
      const next = new Set(prev);
      next.has(slot) ? next.delete(slot) : next.add(slot);
      return next;
    });

  // ADD: holiday toggle helper
  const toggleHoliday = (checked) => {
    setIsHoliday(checked);
    if (checked) {
      setEditSlots(new Set());
    } else {
      setEditSlots(new Set(slotOptions.filter((s) => !dayBooked.has(s))));
    }
  };

  const selectAll = () => { setEditSlots(new Set(slotOptions)); setIsHoliday(false); };
  const clearAll = () => { setEditSlots(new Set()); setIsHoliday(true); };

  const saveDaySlots = async () => {
    if (!openDay) return;
    setSaving(true);
    try {
      const payload = { date: openDay, slots: Array.from(editSlots) }; // desired available
      const res = await fetch('/api/appointments/slots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      const saved = await res.json();
      const savedAvail = saved.available || Array.from(editSlots);
      // reflect availability
      setDaySlots(savedAvail);
      setEditSlots(new Set(savedAvail));
      setIsHoliday(savedAvail.length === 0); // ADD
      // update booked + holiday on calendar
      if (Array.isArray(saved.booked)) {
        setCounts((prev) => ({ ...prev, [openDay]: saved.booked.length }));
        setBookedTimes((prev) => ({ ...prev, [openDay]: saved.booked }));
        setDayBooked(new Set(saved.booked));
      }
      setHolidays((prev) => ({ ...prev, [openDay]: savedAvail.length === 0 })); // ADD
      // optionally await loadMonth();
    } finally {
      setSaving(false);
    }
  };

  const goPrev = () => setMonthDate((d) => firstOfMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1)));
  const goNext = () => setMonthDate((d) => firstOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1)));

  const monthLabel = monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage calendar
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          {/* Month controls: prev • month • next */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.25}
            sx={{ flex: '1 1 280px', minWidth: 0 }}
          >
            <IconButton
              onClick={goPrev}
              aria-label="Previous month"
              disableRipple
              sx={{
                p: 0,             // no extra padding
                width: 24,
                height: 24,       // minimal focus/click area
                '& .MuiSvgIcon-root': { fontSize: 18 },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <Typography
              variant={isSmDown ? 'subtitle1' : 'h6'}
              noWrap
              sx={{
                mx: 0.5,
                fontWeight: 700,
                minWidth: 0,
                flex: 1,                 // take remaining space
                textAlign: 'center',     // center between arrows
                color: 'text.primary',
              }}
              title={monthLabel}
            >
              {monthLabel}
            </Typography>

            <IconButton
              onClick={goNext}
              aria-label="Next month"
              disableRipple
              sx={{
                p: 0,
                width: 24,
                height: 24,
                '& .MuiSvgIcon-root': { fontSize: 18 },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          {/* Right: refresh */}
          <Box sx={{ ml: 'auto', flex: '0 0 auto' }}>
            <Tooltip title="Refresh month">
              <span>
                <IconButton size="small" onClick={loadMonth} disabled={loading} aria-label="Refresh month">
                  {loading ? <CircularProgress size={18} /> : <RefreshIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Weekday headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            px: 0.5,
            mb: 1,
          }}
        >
          {WEEKDAY_LABELS.map((w) => (
            <Typography key={w} variant="caption" sx={{ textAlign: 'center', fontWeight: 700, color: 'text.secondary' }}>
              {w}
            </Typography>
          ))}
        </Box>

        {/* Calendar grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}
        >
          {monthMeta.matrix.map((cell, idx) =>
            cell.dateStr ? (
              <Paper
                key={cell.dateStr}
                onClick={() => openDayDialog(cell.dateStr)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  minHeight: 88,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: holidays[cell.dateStr] ? 'error.light' : (cell.isPast ? 'divider' : 'divider'),
                  transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                  position: 'relative',
                  background: (theme) => {
                    if (holidays[cell.dateStr]) {
                      // transparent red for holiday
                      return alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.22 : 0.08);
                    }
                    if (cell.isPast && !cell.isToday) {
                      // light gray tint for past days
                      return alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.18 : 0.08);
                    }
                    if (cell.isToday) {
                      return theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fffef7';
                    }
                    return theme.palette.background.paper;
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    top: 6,
                    left: 8,
                    fontWeight: 700,
                    color: (theme) => (cell.isPast && !cell.isToday ? theme.palette.text.disabled : theme.palette.text.primary), // gray label for past
                  }}
                >
                  {cell.label}
                </Typography>
                <Box sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loading ? <CircularProgress size={18} /> : null}
                </Box>

                {/* Show Holiday OR Booked count */}
                {holidays[cell.dateStr] ? (
                  <Chip
                    size="small"
                    label="Holiday"
                    color="error"
                    variant="outlined"
                    sx={{ position: 'absolute', top: 6, right: 8 }}
                  />
                ) : (
                  bookedTimes[cell.dateStr]?.length > 0 && (
                    <Tooltip title={`Booked: ${bookedTimes[cell.dateStr].join(', ')}`} placement="top" arrow>
                      <Chip
                        size="small"
                        label={`${bookedTimes[cell.dateStr].length} booked`}
                        color="warning"
                        variant="outlined"
                        sx={{ position: 'absolute', top: 6, right: 8 }}
                      />
                    </Tooltip>
                  )
                )}
              </Paper>
            ) : (
              <Box key={`blank-${idx}`} />
            )
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          Click a day to manage slot availability. Booked slots are locked.
        </Typography>
      </Paper>

      {/* Day details dialog */}
      <Dialog open={Boolean(openDay)} onClose={() => setOpenDay(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          Available slots — {openDay}
          {isHoliday && (
            <Chip label="Holiday" size="small" color="error" variant="outlined" sx={{ ml: 1, verticalAlign: 'middle' }} />
          )}
          {isPastDay && (
            <Chip label="Past day" size="small" color="default" variant="outlined" sx={{ ml: 1, verticalAlign: 'middle' }} />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {dayLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Holiday toggle (disabled for past days) */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isHoliday}
                      onChange={(e) => toggleHoliday(e.target.checked)}
                      disabled={isPastDay} // DISABLE when past
                    />
                  }
                  label="Mark whole day as holiday (close bookings)"
                />
                <Typography variant="caption" color="text.secondary">
                  Selected: {editSlots.size}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button size="small" onClick={selectAll} disabled={isHoliday || isPastDay}>Select all</Button>
                <Button size="small" onClick={clearAll} disabled={isPastDay}>Clear</Button>
              </Stack>

              <FormGroup
                sx={{
                  opacity: (isHoliday || isPastDay) ? 0.5 : 1,                  // VISUAL DISABLE
                  pointerEvents: (isHoliday || isPastDay) ? 'none' : 'auto',    // NO EDITS ON PAST/HOLIDAY
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                  gap: 1,
                }}
              >
                {slotOptions.map((s) => {
                  const isBooked = dayBooked.has(s);
                  return (
                    <FormControlLabel
                      key={s}
                      control={
                        <Checkbox
                          size="small"
                          checked={editSlots.has(s) || isBooked}
                          onChange={() => !isBooked && !isHoliday && !isPastDay && toggleSlot(s)}
                          disabled={isBooked || isHoliday || isPastDay} // DISABLE when past
                        />
                      }
                      label={isBooked ? `${s} (booked)` : s}
                    />
                  );
                })}
              </FormGroup>

              {(isHoliday || isPastDay) && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }} display="block">
                  {isPastDay
                    ? 'Past day: editing is disabled.'
                    : 'Holiday: all remaining slots are closed. Existing bookings (if any) stay.'}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDay(null)} disabled={saving}>Close</Button>
          <Button onClick={saveDaySlots} disabled={saving || isPastDay} variant="contained">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
