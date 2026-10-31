export const metadata = { title: "PothChol — পথচল", description: "Bangla sidewalk hazard copilot for Dhaka" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="bn"><body style={{ fontFamily: "system-ui, 'Noto Sans Bengali', sans-serif", margin: 0, background: "#f7f5f0", color: "#1f2937" }}>{children}</body></html>;
}
