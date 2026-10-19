"use client";

// Last-resort error page when the root layout itself fails. It replaces the
// whole document, so no fonts, translations or providers are available:
// the message is short and shown in all three languages.

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          background: "#FBF8F3",
          color: "#0F2A1D",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Coś poszło nie tak</p>
        <p style={{ fontSize: 16, margin: 0, color: "#4A5D52" }}>Something went wrong · Etwas ist schiefgelaufen</p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            height: 52,
            padding: "0 28px",
            border: 0,
            borderRadius: 14,
            background: "#C1121F",
            color: "#FFFFFF",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Spróbuj ponownie · Try again · Noch einmal
        </button>
      </body>
    </html>
  );
}
