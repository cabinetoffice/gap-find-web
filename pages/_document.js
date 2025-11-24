import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Updated meta tags and favicon links for GOV.UK Frontend v5.10.0 rebranded assets */}
        <meta name="theme-color" content="#1d70b8" />
        <link
          rel="icon"
          sizes="48x48"
          href="/assets/rebrand/images/favicon.ico"
        />
        <link
          rel="icon"
          sizes="any"
          href="/assets/rebrand/images/favicon.svg"
          type="image/svg+xml"
        />
        <link
          rel="mask-icon"
          href="/assets/rebrand/images/govuk-icon-mask.svg"
          color="#1d70b8"
        />
        <link
          rel="apple-touch-icon"
          href="/assets/rebrand/images/govuk-icon-180.png"
        />
        <link rel="manifest" href="/assets/rebrand/manifest.json" />
        <meta
          property="og:image"
          content="/assets/rebrand/images/govuk-opengraph-image.png"
        />        
      </Head>
      <body>
        {/* GOV.UK Frontend support detection script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.body.className += ' js-enabled' + ('noModule' in HTMLScriptElement.prototype ? ' govuk-frontend-supported' : '');`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
