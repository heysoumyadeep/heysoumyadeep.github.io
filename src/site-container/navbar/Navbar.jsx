import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from '../theme-toggle/ThemeToggle';
import { NAV_ITEMS, ROUTES } from '@config/site';
import './Navbar.scss';

function NavLink({ item, onNavigate }) {
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

  if (item.type === 'route') {
    return (
      <Link to={item.href} className="navbar__link" onClick={handleClick}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} className="navbar__link" onClick={handleClick}>
      {item.label}
    </a>
  );
}

// Theme-aware animated logo with crazy effects
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">

          {/* Logo — favicon SVG, theme-aware */}
          <Link to={ROUTES.HOME} className="navbar__logo" aria-label="Home" onClick={handleLogoClick}>
            <SiteLogo />
          </Link>

          <ul className="navbar__menu navbar__menu--desktop">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}><NavLink item={item} /></li>
            ))}
          </ul>

          <div className="navbar__actions">
            <ThemeToggle />
            {/* Burger — only shown when menu is CLOSED */}
            {!menuOpen && (
              <button
                type="button"
                className="navbar__burger"
                aria-label="Open menu"
                aria-expanded={false}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(true)}
              >
                <span /><span /><span />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        {/* Close button inside the panel — always visible when open */}
        <button
          type="button"
          className="mobile-menu__close"
          aria-label="Close menu"
          onClick={closeMenu}
        >
          <span />
          <span />
        </button>

        <ul className="mobile-menu__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}><NavLink item={item} onNavigate={closeMenu} /></li>
          ))}
        </ul>

        {/* Aurora ribbons — decorative animation in the empty space */}
        <div className="mobile-menu__aurora" aria-hidden="true">
          <div className="aurora__ribbon aurora__ribbon--1" />
          <div className="aurora__ribbon aurora__ribbon--2" />
          <div className="aurora__ribbon aurora__ribbon--3" />
        </div>
      </div>

      <div
        className={`mobile-menu__backdrop ${menuOpen ? 'mobile-menu__backdrop--open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
}
