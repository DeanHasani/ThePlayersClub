"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Cookies() {
  const [visible, setVisible] = useState<boolean>(false);
  const [animate, setAnimate] = useState<boolean>(false);

  useEffect(() => {
    // Check if consent cookie exists
    const consentCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("cookie_consent="));

    // Show banner only if cookie is missing (works in dev & prod)
    if (!consentCookie) {
      setTimeout(() => {
        setVisible(true);
        setTimeout(() => setAnimate(true), 50); // trigger slide up
      }, 200);
    }
  }, []);

  const handleClose = (value?: "accepted" | "declined") => {
    if (value) {
      const maxAge = 60 * 60 * 24 * 365; // 1 year
      const secure = location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `cookie_consent=${value}; max-age=${maxAge}; path=/; SameSite=Lax${secure}`;
    }

    setAnimate(false); // slide down
    setTimeout(() => setVisible(false), 500); // match transition duration
  };

  if (!visible) return null;

  return (
    <div style={overlayStyle}>
      <div
        style={{
          ...containerStyle,
          transform: animate ? "translateY(0)" : "translateY(120%)",
          opacity: animate ? 1 : 0,
        }}
      >
        {/* Close (X) button */}
        <button style={closeBtnStyle} onClick={() => handleClose()}>
          ✕
        </button>

        <Image
          src="/cookie.svg"
          alt="Cookie icon"
          width={55}
          height={55}
          priority
        />
        <strong style={titleStyle}>WE USE COOKIES</strong>
        <div style={descStyle}>
          Please accept our cookies to continue enjoying our site. For more
          information read{" "}
          <b>
            <u>
              <a href="/info/privacy-policy">Privacy Policy</a>
            </u>
          </b>
          .
        </div>
        <div style={actionsStyle}>
          <button
            onClick={() => handleClose("accepted")}
            style={acceptBtnStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
          >
            Accept
          </button>
          <button
            onClick={() => handleClose("declined")}
            style={declineBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#000";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#000";
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 15,
  right: 20,
  zIndex: 9999,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  pointerEvents: "none",
};

const containerStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  pointerEvents: "auto",
  background: "white",
  padding: "10px 12px 12px 12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  width: 180,
  transition: "all 0.5s ease", // smooth slide, slightly slower
};

const closeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: 4,
  right: 6,
  background: "transparent",
  border: "none",
  fontSize: 14,
  cursor: "pointer",
  transition: "color 0.2s",
};

const titleStyle: React.CSSProperties = {
  marginTop: 6,
  marginBottom: 4,
  fontSize: 15,
  fontWeight: 400,
  fontFamily: "'Luckiest Guy', cursive",
};

const descStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#333",
  marginBottom: 8,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
};

const acceptBtnStyle: React.CSSProperties = {
  border: "none",
  padding: "4px 6px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
  background: "#000",
  color: "#fff",
  transition: "background 0.2s",
};

const declineBtnStyle: React.CSSProperties = {
  border: "1px solid rgba(0,0,0,0.2)",
  padding: "4px 6px",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
  background: "transparent",
  color: "#000",
  transition: "all 0.2s",
};
