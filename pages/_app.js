import NotificationPopup from '../components/NotificationPopup';

// ... existing imports ...

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <NotificationPopup />
    </>
  );
}

export default MyApp; 