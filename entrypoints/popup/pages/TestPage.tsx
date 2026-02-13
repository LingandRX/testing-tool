import { sendMessage } from '@/utils/messages';
import { Button } from '@mui/material';

const TestPage = () => {
  const handleSeedMessage = async () => {
    const status = await sendMessage('popup:check-status');
    console.log(`[popup]status: ${status}`);
  };
  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleSeedMessage}>
        发送消息
      </Button>
    </div>
  );
};

export default TestPage;
