const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { init } = require('./db');
const { authRouter } = require('./routes/auth');
const { appointmentsRouter } = require('./routes/appointments');
const { contactRouter } = require('./routes/contact');
const { patientsRouter } = require('./routes/patients');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/patients', patientsRouter);

init().then(() => {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}).catch((e) => {
  console.error('Failed to init DB', e);
  process.exit(1);
});
