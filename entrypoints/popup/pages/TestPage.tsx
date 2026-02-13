import { sendMessage } from '@/utils/messages';
import { Button } from '@mui/material';

const TestPage = () => {
  const handleSeedMessage = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    tabs.forEach(async (tab) => {
      console.log(tab.id);
      const length = await sendMessage('getStringLength', 'hello world', tab.id);
      console.log('字符串长度:', length);
    });
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
