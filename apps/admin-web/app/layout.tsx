import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Body By Carisma — Admin',
  description: 'Admin dashboard for Body By Carisma',
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
