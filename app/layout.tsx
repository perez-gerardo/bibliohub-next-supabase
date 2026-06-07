import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookStore - Sistema de Biblioteca",
  description: "Administra autores, libros y estadísticas de biblioteca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                  B
                </span>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                  Book<span className="text-emerald-500 dark:text-emerald-400">Store</span>
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-all"
                >
                  Autores
                </Link>
                <Link
                  href="/books"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-all"
                >
                  Libros
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/books"
                className="flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200"
              >
                Buscar Libros
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
            © 2026 BookStore - Lab de Desarrollo Web. Todos los derechos reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}
