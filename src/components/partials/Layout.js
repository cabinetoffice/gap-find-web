import { useEffect } from 'react';
import CookieBanner from './cookie-banner';
import Footer from './Footer';
import { Header } from './header';
import { useAuth } from '../../../pages/_app';

const Layout = ({ children, isBasicHeader = false }) => {
  const { isUserLoggedIn } = useAuth();
  const clx = [
    'js-enabled',
    'govuk-template__body',
    'govuk-template--rebranded',
  ];
  useEffect(() => {
    document.querySelector('body').classList.add(...clx);
  });

  useEffect(() => {
    // Initialize GOV.UK Frontend components
    const initGOVUKFrontend = () => {
      const GOVUKFrontend = window.GOVUKFrontend;
      if (typeof GOVUKFrontend !== 'undefined') {
        GOVUKFrontend?.initAll();
      }
    };

    // Wait for the script to load and then initialize
    const checkAndInit = () => {
      if (window.GOVUKFrontend) {
        initGOVUKFrontend();
      } else {
        // Retry after a short delay
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();
  }, []);

  return (
    <>
      <CookieBanner />
      <Header isUserLoggedIn={isUserLoggedIn} isBasic={isBasicHeader} />
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
