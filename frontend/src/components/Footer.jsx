import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Store Rating Management System. Production-Ready Full Stack Architecture.</p>
        <p className="footer-meta">Roles: Administrator &bull; Normal User &bull; Store Owner</p>
      </div>
    </footer>
  );
};

export default Footer;
