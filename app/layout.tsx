import "./globals.css";

export const metadata = {
  title: "Entrepreneur — The Game",
  description: "Build. Grow. Scale.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}