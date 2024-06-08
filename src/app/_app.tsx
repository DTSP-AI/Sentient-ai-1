import { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import '../globals.css'; // Adjust the path if necessary

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <ClerkProvider>
      <Component {...pageProps} key={router.asPath} />
    </ClerkProvider>
  );
}

export default MyApp;
