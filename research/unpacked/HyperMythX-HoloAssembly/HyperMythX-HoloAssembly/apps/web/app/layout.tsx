export const metadata = {
  title: 'HyperMythX Operator Panel',
  description: 'Lightweight operator shell for HyperMythX HoloAssembly'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', background: '#111', color: '#eee', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
