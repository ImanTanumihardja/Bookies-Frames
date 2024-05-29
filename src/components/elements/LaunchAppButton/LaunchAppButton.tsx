import { Button } from '@chakra-ui/react';


const LaunchAppButton = () => {
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button size="sm" onClick= {
      () => openInNewTab('https://warpcast.com/bookies')
      }>
      Launch App
    </Button>
  );
};

export default LaunchAppButton;
