// pages/_app.tsx
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyApp({ Component, pageProps: {...pageProps } }: AppProps) {
  return (
    
      <Component {...pageProps} />
   
  );
}
