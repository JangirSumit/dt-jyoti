
import React, { Component } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import EventAvailable from "@mui/icons-material/EventAvailable";
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import DeleteIcon from "@mui/icons-material/Delete";
import "./App.css";


export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPlan: "-- select Plan--",
      data: "",
      booking: { name: "", contact: "", date: "", slot: "" },
  appointments: [],
      snackbar: { open: false, message: "", severity: "success" },
      availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
  slotsForDate: [],
    };
  }

  componentDidMount() {
    this.fetchAppointments();
  }

  async selectPlan(event) {
    const value = event.target.value;
    if (value === "-- select Plan--") {
      this.setState({ data: "", selectedPlan: value });
      return;
    }
    const url = `data/${value}.txt`;
    try {
      const result = await fetch(url);
      const data = await result.text();
      this.setState({ data, selectedPlan: value });
    } catch {
      this.setState({ data: "Plan not found.", selectedPlan: value });
    }
  }

  copyText = () => {
    navigator.clipboard.writeText(this.state.data);
    this.setState({ snackbar: { open: true, message: "Copied to clipboard!", severity: "success" } });
  };

  fetchAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      const data = await res.json();
      this.setState({ appointments: data });
    } catch (e) {
      // noop
    }
  };

  handleBookingChange = (e) => {
    const { name, value } = e.target;
    this.setState(
      (prev) => ({ booking: { ...prev.booking, [name]: value } }),
      async () => {
        if (name === "date" && value) {
          await this.fetchSlots(value);
        }
      }
    );
  };

  handleBookingSubmit = async (e) => {
    e.preventDefault();
    const { name, contact, date, slot } = this.state.booking;
    if (!name || !contact || !date || !slot) {
      this.setState({ snackbar: { open: true, message: "Please fill all fields.", severity: "error" } });
      return;
    }
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, date, slot })
      });
      if (res.status === 409) {
        this.setState({ snackbar: { open: true, message: "Slot already booked.", severity: "error" } });
        return;
      }
      if (!res.ok) throw new Error('Failed to book');
      const appt = await res.json();
      this.setState((prev) => ({
        appointments: [...prev.appointments, appt],
        booking: { name: "", contact: "", date: "", slot: "" },
        snackbar: { open: true, message: "Appointment booked!", severity: "success" },
      }));
    } catch (err) {
      this.setState({ snackbar: { open: true, message: "Booking failed.", severity: "error" } });
    }
  };

  fetchSlots = async (date) => {
    try {
      const res = await fetch(`/api/slots?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      const slots = Array.isArray(data.slots) ? data.slots : [];
      this.setState((prev) => ({
        slotsForDate: slots,
        booking: {
          ...prev.booking,
          slot: slots.includes(prev.booking.slot) ? prev.booking.slot : "",
        },
      }));
    } catch (e) {
      // Fallback compute from local appointments
      const bookedSlots = this.state.appointments
        .filter((a) => a.date === date)
        .map((a) => a.slot);
      const slots = this.state.availableSlots.filter((s) => !bookedSlots.includes(s));
      this.setState((prev) => ({
        slotsForDate: slots,
        booking: { ...prev.booking, slot: slots.includes(prev.booking.slot) ? prev.booking.slot : "" },
      }));
    }
  };

  deleteAppointment = async (id) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      this.setState((prev) => ({
        appointments: prev.appointments.filter((a) => a.id !== id),
        snackbar: { open: true, message: "Appointment canceled.", severity: "success" },
      }));
    } catch (e) {
      this.setState({ snackbar: { open: true, message: "Failed to cancel appointment.", severity: "error" } });
    }
  };

  handleSnackbarClose = () => {
    this.setState({ snackbar: { ...this.state.snackbar, open: false } });
  };


  render() {
    const plans = [
      "-- select Plan--",
      "Diabetes",
      "PCOD",
      "Thyroid",
      "Heart",
      "Pregnancy",
      "Lectation",
      "Renal",
      "Renal Stone",
      "Liver",
      "Gluten Free",
      "Arthritis",
      "Asthma",
      "2000 KCal",
      "1200 KCal",
      "1800 KCal",
      "1600 KCal",
    ];

    const { booking, snackbar } = this.state;

    return (
      <div className="App">
        <AppBar position="static" color="primary">
          <Toolbar>
            <RestaurantMenu style={{ marginRight: 10 }} />
            <Typography variant="h6">Dietitian Jyoti</Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" style={{ marginTop: 30 }}>
          <Paper elevation={3} style={{ padding: 24, marginBottom: 32 }}>
            <Typography variant="h5" gutterBottom>Choose Diet Plan</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={this.state.selectedPlan}
                  onChange={(e) => this.selectPlan(e)}
                  variant="outlined"
                >
                  {plans.map((p, i) => (
                    <MenuItem key={i} value={p}>{p}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" color="primary" onClick={this.copyText} disabled={!this.state.data}>Copy Plan</Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  multiline
                  rows={6}
                  fullWidth
                  variant="outlined"
                  value={this.state.data}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={3} style={{ padding: 24, marginBottom: 32 }}>
            <Typography variant="h5" gutterBottom><EventAvailable style={{ verticalAlign: "middle" }} /> Book Appointment</Typography>
            <form onSubmit={this.handleBookingSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Name" name="name" value={booking.name} onChange={this.handleBookingChange} fullWidth required variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Contact" name="contact" value={booking.contact} onChange={this.handleBookingChange} fullWidth required variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField type="date" label="Date" name="date" value={booking.date} onChange={this.handleBookingChange} fullWidth required variant="outlined" InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    name="slot"
                    value={booking.slot}
                    onChange={this.handleBookingChange}
                    fullWidth
                    variant="outlined"
                    required
                    displayEmpty
                  >
                    <MenuItem value=""><em>Select Slot</em></MenuItem>
                    {booking.date && this.state.slotsForDate.map((slot, i) => (
                      <MenuItem key={i} value={slot}>{slot}</MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="secondary">Book Appointment</Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          <Paper elevation={3} style={{ padding: 24 }}>
            <Typography variant="h6" gutterBottom>Upcoming Appointments</Typography>
            {this.state.appointments.length === 0 ? (
              <Typography>No appointments booked yet.</Typography>
            ) : (
              <Box>
                {this.state.appointments.map((a) => (
                  <Paper key={a.id || `${a.date}-${a.slot}-${a.contact}`} style={{ margin: "8px 0", padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography><b>{a.name}</b> ({a.contact})</Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography>Date: {a.date} | Slot: {a.slot}</Typography>
                      {a.id && (
                        <IconButton aria-label="delete" color="error" onClick={() => this.deleteAppointment(a.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
        </Container>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={this.handleSnackbarClose}>
          <Alert onClose={this.handleSnackbarClose} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </div>
    );
  }
}

export default App;
