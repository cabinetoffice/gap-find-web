import { useEffect } from 'react';
import CookieBanner from './cookie-banner';
import Footer from './Footer';
import Header from './Header';

const Layout = ({ children, showNavigation = true, showBetaBlock = true }) => {
  const clx = ['js-enabled', 'govuk-template__body'];
  useEffect(() => {
    document.querySelector('body').classList.add(...clx);
  });

  useEffect(() => {
    const GOVUKFrontend = window.GOVUKFrontend;
    if (typeof GOVUKFrontend !== 'undefined') {
      GOVUKFrontend?.initAll();
    }
  }, []);

  return (
    <>
      <CookieBanner />
      <Header showNavigation={showNavigation} showBetaBlock={showBetaBlock} />
      <div className="govuk-width-container">
        <main
          className="govuk-main-wrapper govuk-main-wrapper--auto-spacing padding-top0"
          id="main-content"
          role="main"
        >
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
