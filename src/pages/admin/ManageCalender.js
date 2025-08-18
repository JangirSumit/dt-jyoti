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
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';

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

export default function ManageCalendar() {
  const [monthDate, setMonthDate] = useState(firstOfMonth(new Date()));
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({}); // { 'YYYY-MM-DD': number }
  const abortRef = useRef(null);

  // Day details dialog
  const [openDay, setOpenDay] = useState(null); // 'YYYY-MM-DD' | null
  const [daySlots, setDaySlots] = useState(null); // string[] | null
  const [dayLoading, setDayLoading] = useState(false);

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
      };
    });
    return { first, last, leadingBlanks, daysInMonth, matrix };
  }, [monthDate]);

  const loadMonth = async () => {
    try {
      setLoading(true);
      // cancel previous
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      // Build date list for the month
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
            const n = Array.isArray(data.slots) ? data.slots.length : 0;
            return [d, n];
          } catch {
            return [d, 0];
          }
        })
      );

      const map = {};
      results.forEach(([d, n]) => (map[d] = n));
      setCounts(map);
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
    setDayLoading(true);
    try {
      const res = await fetch(`/api/appointments/slots?date=${encodeURIComponent(dateStr)}`);
      const data = await res.json();
      setDaySlots(Array.isArray(data.slots) ? data.slots : []);
    } catch {
      setDaySlots([]);
    } finally {
      setDayLoading(false);
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
                  borderColor: 'divider',
                  transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                  position: 'relative',
                  background:
                    cell.isToday
                      ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#fffef7')
                      : 'background.paper',
                }}
              >
                <Typography variant="caption" sx={{ position: 'absolute', top: 6, left: 8, fontWeight: 700 }}>
                  {cell.label}
                </Typography>
                <Box sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {loading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Chip
                      size="small"
                      label={`${counts[cell.dateStr] ?? 0} slots`}
                      color={(counts[cell.dateStr] ?? 0) > 0 ? 'success' : 'default'}
                      variant={(counts[cell.dateStr] ?? 0) > 0 ? 'outlined' : 'filled'}
                    />
                  )}
                </Box>
              </Paper>
            ) : (
              <Box key={`blank-${idx}`} />
            )
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          Click a day to view available slots. This view is read-only.
        </Typography>
      </Paper>

      {/* Day details dialog */}
      <Dialog open={Boolean(openDay)} onClose={() => setOpenDay(null)} fullWidth maxWidth="xs">
        <DialogTitle>Available slots — {openDay}</DialogTitle>
        <DialogContent dividers>
          {dayLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress />
            </Box>
          ) : (daySlots?.length ?? 0) > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {daySlots.map((s) => (
                <Chip key={s} label={s} variant="outlined" />
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No slots available for this date.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDay(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
