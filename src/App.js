
import React, { Component } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import About from './pages/About';
import Appointment from './pages/Appointment';
import Contact from './pages/Contact';
import Blogs from './pages/Blogs';
import Calculator from './pages/Calculator';
import Footer from './components/Footer';
import BlogDetail from './pages/BlogDetail';
import AIPlans from './pages/AIPlans';
import AdminLayout from './pages/admin/AdminLayout';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPatients from './pages/admin/AdminPatients';
import AdminBlogNew from './pages/admin/AdminBlogNew';
import AdminPrescriptions from './pages/admin/AdminPrescriptions';
import AdminLogin from './pages/admin/Login';
import "./App.css";

function ProtectedRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admintoken') : null;
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}

function PublicLayout() {
  return (
    <>
      <NavBar />
  <Container maxWidth="lg" style={{ marginTop: 30, marginBottom: 30 }}>
        <Outlet />
      </Container>
      <Footer />
    </>
  );
}


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

  const { snackbar } = this.state;

    return (
      <div className="App">
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/appointment" element={<Appointment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<BlogDetail />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/ai-plans" element={<AIPlans />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Route>
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="appointments" replace />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="patients" element={<AdminPatients />} />
              <Route path="blogs/new" element={<AdminBlogNew />} />
              <Route path="prescriptions" element={<AdminPrescriptions />} />
            </Route>
          </Routes>
        </BrowserRouter>
  <Container maxWidth="lg" style={{ marginTop: 30 }}>
          <Paper elevation={3} style={{ padding: 24, marginBottom: 32, display: 'none' }}>
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

  </Container>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={this.handleSnackbarClose}>
          <Alert onClose={this.handleSnackbarClose} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </div>
    );
  }
}

export default App;
