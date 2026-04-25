import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FloatingAIButton from "@/components/FloatingAIButton";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-pjs",
  display: "swap"
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fonova.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fonova — Startup Yatırım ve Destek Platformu",
    template: "%s | Fonova"
  },
  description:
    "Paya dayalı kitle fonlaması ve gönüllü destek projelerini aynı çatı altında sunan Fonova platformu.",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Fonova",
    url: SITE_URL,
    images: [{ url: `${SITE_URL}/branding/fonova-logo-star-v1-transparent.png`, width: 320, height: 84, alt: "Fonova" }]
  },
  twitter: {
    card: "summary_large_image"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 }
  },
  alternates: {
    canonical: SITE_URL
  }
};

const navItems = [
  { href: "/", label: "Pazar Yeri" },
  { href: "/founder", label: "Girişimci" },
  { href: "/compliance", label: "Uyum" },
  { href: "/data-room", label: "Veri Odası" },
  { href: "/pro", label: "Fonova Pro" },
  { href: "/architecture", label: "Mimari" },
  { href: "/admin", label: "Yönetim" }
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <main className="min-h-[100dvh] w-full max-w-full overflow-x-hidden">
          <header className="fixed top-0 z-30 w-full border-b border-slate-200/80 bg-white/94 shadow-[0_16px_42px_-38px_rgba(46,9,136,0.16)] backdrop-blur-2xl">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
              <div className="flex items-center gap-5 lg:gap-8">
                <Link href="/" className="group rounded-full focus-visible:focus-ring" aria-label="Fonova anasayfa">
                  <Image
                    src="/branding/fonova-logo-star-v1-transparent.png"
                    alt="Fonova"
                    width={320}
                    height={84}
                    className="h-12 w-auto sm:h-[3.35rem]"
                    priority
                  />
                </Link>
                <nav className="hidden items-center gap-1 lg:flex">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-100 hover:text-slate-950 focus-visible:focus-ring"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/#gonullu-destek"
                  className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent/20 hover:bg-slate-50 hover:text-accent active:scale-[0.97] md:block"
                >
                  Destek Ol
                </Link>
                <Link
                  href="/#yatirim-projeleri"
                  className="rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-[0_12px_30px_-22px_rgba(46,9,136,0.42)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent-hover active:scale-[0.97] sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  Yatırım Yap
                </Link>
              </div>
            </div>
            <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-2 sm:px-6 sm:pb-3 lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-[0_8px_24px_-22px_rgba(46,9,136,0.14)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <div className="pt-24 sm:pt-28 lg:pt-16">{children}</div>

          <FloatingAIButton />

          <footer className="w-full border-t border-slate-200/80 bg-white pb-10 pt-14 sm:pt-20">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:px-6 md:grid-cols-4 lg:grid-cols-6 lg:px-8">
              <div className="col-span-2">
                <Link href="/" className="mb-4 block w-fit focus-visible:focus-ring" aria-label="Fonova anasayfa">
                  <Image
                    src="/branding/fonova-logo-star-v1-transparent.png"
                    alt="Fonova"
                    width={320}
                    height={84}
                    className="h-[3.35rem] w-auto"
                  />
                </Link>
                <p className="mb-6 max-w-xs text-xs leading-relaxed text-slate-600">
                  Fonova, paya dayalı yatırım kampanyalarını ve gönüllü destek projelerini aynı pazar yeri
                  deneyiminde birleştiren regülasyona hazır MVP'dir.
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  2026 Fonova. Demo ve pilot hazırlık sürümü.
                </p>
              </div>

              <div className="col-span-1">
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900">Yasal</h4>
                <ul className="space-y-3 text-xs leading-relaxed">
                  <li><a href="/compliance" className="text-slate-600 transition-colors duration-300 hover:text-accent">Risk Bildirimi</a></li>
                  <li><a href="/compliance" className="text-slate-600 transition-colors duration-300 hover:text-accent">Yatırımcı Sözleşmesi</a></li>
                  <li><a href="/data-room" className="text-slate-600 transition-colors duration-300 hover:text-accent">Gizlilik Politikası</a></li>
                  <li><a href="/compliance" className="text-slate-600 transition-colors duration-300 hover:text-accent">KVKK Uyumu</a></li>
                </ul>
              </div>

              <div className="col-span-1">
                <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900">Ürün</h4>
                <ul className="space-y-3 text-xs leading-relaxed">
                  <li><a href="/founder" className="text-slate-600 transition-colors duration-300 hover:text-accent">Girişimci Paneli</a></li>
                  <li><a href="/#gonullu-destek" className="text-slate-600 transition-colors duration-300 hover:text-accent">Gönüllü Destek</a></li>
                  <li><a href="/pro" className="text-slate-600 transition-colors duration-300 hover:text-accent">Fonova Pro</a></li>
                  <li><a href="/architecture" className="text-slate-600 transition-colors duration-300 hover:text-accent">Sistem Mimarisi</a></li>
                </ul>
              </div>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}
