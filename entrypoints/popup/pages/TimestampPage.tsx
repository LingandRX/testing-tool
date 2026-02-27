import { TimestampToDatetime } from '@/components/TimestampToDatetime';
import { DatetimeToTimestamp } from '@/components/DatetimeToTimestamp';
import { TimestampExecution } from '@/components/TimestampExecution';
import { Container, Box } from '@mui/material';

const TimestampPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <TimestampExecution />
        <TimestampToDatetime />
        <DatetimeToTimestamp />
      </Box>
    </Container>
  );
};

export default TimestampPage;
