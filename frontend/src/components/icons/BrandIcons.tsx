import React from "react";

// Small brand marks not covered by lucide-react (Bitbucket, Google). Sized
// and styled to sit next to lucide icons (18px, currentColor where the brand
// allows monochrome, real brand colors where recognition matters).

export function BitbucketIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M2.5 3a.6.6 0 0 0-.59.7l3.26 16.66c.1.5.53.85 1.03.85h11.6c.4 0 .74-.29.8-.68L21.6 3.7a.6.6 0 0 0-.59-.7H2.5Zm13.85 11.2H7.66l-1.5-8.4h10.7l-1.5 8.4Z"
        fill="#2684FF"
      />
    </svg>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M23.04 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.19a5.3 5.3 0 0 1-2.3 3.48v2.9h3.72c2.18-2 3.43-4.96 3.43-8.41Z"
        fill="#4285F4"
      />
      <path
        d="M12 23.5c3.11 0 5.72-1.03 7.62-2.8l-3.72-2.9c-1.03.7-2.36 1.1-3.9 1.1-3 0-5.54-2.02-6.45-4.75H1.72v2.98A11.5 11.5 0 0 0 12 23.5Z"
        fill="#34A853"
      />
      <path
        d="M5.55 14.15a6.9 6.9 0 0 1 0-4.3V6.87H1.72a11.5 11.5 0 0 0 0 10.26l3.83-2.98Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.1c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.7 1.68 15.1.5 12 .5A11.5 11.5 0 0 0 1.72 6.87l3.83 2.98C6.46 7.12 9 5.1 12 5.1Z"
        fill="#EA4335"
      />
    </svg>
  );
}
