import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Container, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Typography,
  Alert,
  SelectChangeEvent 
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({
  region: 'us-east-1', // replace with your region
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || ''
  }
});

function App() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [person, setPerson] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePersonChange = (event: SelectChangeEvent) => {
    setPerson(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !person) {
      setError('Please select both a date and a person');
      return;
    }

    try {
      const input = {
        date: selectedDate.format('YYYY-MM-DD'),
        person: person
      };

      const command = new InvokeCommand({
        FunctionName: 'calendar-lambda',
        Payload: JSON.stringify(input)
      });

      const response = await lambda.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.Payload));
      
      if (result.statusCode === 200) {
        const body = JSON.parse(result.body);
        setMessage(`Successfully saved: ${body.person} on ${body.date}`);
        setError('');
      } else {
        setError('Failed to save date');
      }
    } catch (err) {
      setError('Error invoking Lambda function');
      console.error(err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Calendar Date Scheduler
          </Typography>

          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />

          <FormControl fullWidth>
            <InputLabel>Person</InputLabel>
            <Select
              value={person}
              label="Person"
              onChange={handlePersonChange}
            >
              <MenuItem value="e">Emmy</MenuItem>
              <MenuItem value="m">Millie</MenuItem>
              <MenuItem value="b">Both Girls</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!selectedDate || !person}
          >
            Save Date
          </Button>

          {message && (
            <Alert severity="success">
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default App;