import React from "react";
import "./BrandLogo.css";

/**
 * Shared Champion Arena logo for Login, Registration and other public pages.
 * Pass onClick to render it as an accessible button; otherwise it renders as a div.
 */
export default function BrandLogo({ onClick, className = "", imageClassName = "" }) {
  const image = (
    <img
      className={`ca-brand-logo-image ${imageClassName}`.trim()}
      src="/images/champion-arena-logo.png"
      alt="Champion Arena"
      draggable="false"
      decoding="async"
    />
  );

  const classes = `ca-brand-logo ${className}`.trim();

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label="Champion Arena home"
      >
        {image}
      </button>
    );
  }

  return <div className={classes}>{image}</div>;
}
