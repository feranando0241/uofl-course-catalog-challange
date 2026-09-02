/**
 * Header.jsx
 * ==========
 * Application header with UofL logo, title, and course count badge.
 */

// Logo path resolved relative to the Vite base URL (works both locally and on GitHub Pages)
const UOFL_LOGO = `${import.meta.env.BASE_URL}assets/uofl-cardinal.png`;

export default function Header({ totalCourses }) {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        {/* UofL Cardinal Logo */}
        <img
          src={UOFL_LOGO}
          alt="University of Louisville Cardinal Logo"
          className="header-logo"
          id="uofl-logo"
          aria-hidden="false"
        />

        <div className="header-text">
          <h1 className="header-title" id="page-title">
            <span>UofL</span> Course Catalog
          </h1>
          <p className="header-subtitle">
            University of Louisville — Academic Course Directory
          </p>
        </div>

        {/* Live course count badge */}
        {totalCourses > 0 && (
          <span className="header-badge" aria-label={`${totalCourses.toLocaleString()} total courses`}>
            {totalCourses.toLocaleString()} Courses
          </span>
        )}
      </div>
    </header>
  );
}
