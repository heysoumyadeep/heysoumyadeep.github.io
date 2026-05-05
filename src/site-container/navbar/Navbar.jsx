import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../theme-toggle/ThemeToggle';
import { NAV_ITEMS, ROUTES } from '@config/site';
import './Navbar.scss';

function NavLink({ item, onNavigate, isMobile = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (item.type === 'route') {
      onNavigate?.();
      return;
    }
    e.preventDefault();
    onNavigate?.();

    if (location.pathname !== ROUTES.HOME) {
      navigate(`${ROUTES.HOME}${item.href}`);
      return;
    }

    navigate(`${item.href}`, { replace: false });
    const target = document.querySelector(item.href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Determine if this link is active
  const isActive = item.type === 'route' 
    ? location.pathname === item.href
    : location.pathname === ROUTES.HOME && location.hash === item.href;

  const linkClass = `navbar__link${isMobile && isActive ? ' navbar__link--active' : ''}`;

  if (item.type === 'route') {
    return (
      <Link to={item.href} className={linkClass} onClick={handleClick}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} className={linkClass} onClick={handleClick}>
      {item.label}
    </a>
  );
}

// Theme-aware animated logo
function SiteLogo() {
  return (
    <svg
      className="navbar__logo-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="36"
      height="36"
      aria-hidden="true"
    >
      <rect
        className="navbar__logo-rect"
        width="32"
        height="32"
        rx="8"
      />
      <text
        className="navbar__logo-letter"
        x="16"
        y="22"
        fontFamily="Poppins, sans-serif"
        fontSize="18"
        fontWeight="700"
        textAnchor="middle"
      >
        S
      </text>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        rafId = null;
      });
    };
    
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (location.hash && location.pathname === ROUTES.HOME) {
      const target = document.querySelector(location.hash);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  }, [location]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate(ROUTES.HOME);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  return (
    <>
      <nav className={`navbar${scrolled || !isHomePage ? ' navbar--scrolled' : ''}${menuOpen ? ' navbar--menu-open' : ''}`}>
        <div className="navbar__inner container">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="navbar__logo" aria-label="Home" onClick={handleLogoClick}>
            <SiteLogo />
          </Link>

          <ul className="navbar__menu navbar__menu--desktop">
            {NAV_ITEMS.filter(item => !(isHomePage && !scrolled && item.href === '#home')).map((item) => (
              <li key={item.label}><NavLink item={item} /></li>
            ))}
          </ul>

          <div className="navbar__actions">
            <ThemeToggle />
            {/* Hamburger — mobile only */}
            <button
              type="button"
              className="navbar__burger navbar__burger--navbar"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen ? '' : undefined}
      >
        {/* Close button */}
        <button
          type="button"
          className="navbar__burger navbar__burger--close"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        >
          <span /><span /><span />
        </button>

        <ul className="mobile-menu__list">
            {NAV_ITEMS.filter(item => !(isHomePage && !scrolled && item.href === '#home')).map((item) => (
              <li key={item.label}><NavLink item={item} onNavigate={closeMenu} isMobile={true} /></li>
            ))}
          </ul>

        {/* Aurora orbs */}
        <div className="mobile-menu__aurora" aria-hidden="true">          <div className="mobile-menu__orb mobile-menu__orb--1" />
          <div className="mobile-menu__orb mobile-menu__orb--2" />
          <div className="mobile-menu__orb mobile-menu__orb--3" />
        </div>
      </div>
    </>
  );
}
