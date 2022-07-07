import '../styles/globals.css';
import { ProofOfHumanityProvider } from 'poh-react';

function MyApp({ Component, pageProps }) {
  return (
    <ProofOfHumanityProvider>
      <Component {...pageProps} />
    </ProofOfHumanityProvider>
  );
}

export default MyApp;
