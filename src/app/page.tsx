import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { auth } from '@clerk/nextjs/server';

export const metadata: Metadata = {
  title: 'Cutline | Your creative business, finally organized',
  description: 'Clients, projects, invoicing, and feedback — all in one place. Built for photographers, designers, video editors, and creative studios.',
  openGraph: {
    title: 'Cutline | Your creative business, finally organized',
    description: 'Clients, projects, invoicing, and feedback — all in one place. Built for creative professionals.',
    url: 'https://cutline.app',
    siteName: 'Cutline',
    images: [
      {
        url: '/og-image.jpg', // Replace with your actual OG image URL in the public directory
        width: 1200,
        height: 630,
        alt: 'Cutline - Your creative business, finally organized',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cutline | Your creative business, finally organized',
    description: 'Clients, projects, invoicing, and feedback — all in one place. Built for creative professionals.',
    images: ['/og-image.jpg'],
  },
};

export default async function MarketingHomepage() {
  const { userId } = await auth();
  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-xl tracking-tight">
              Cutline
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600">
              <Link href="#features" className="hover:text-zinc-950 transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-zinc-950 transition-colors">Pricing</Link>
              <Link href="#about" className="hover:text-zinc-950 transition-colors">About</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>Go to dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">
                  Log in
                </Link>
                <Link href="/sign-up" className={buttonVariants({ variant: "default" })}>Start free</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-24 md:py-32 lg:py-40 text-center px-4">
          <div className="container mx-auto max-w-4xl flex flex-col items-center">
            <div className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800 mb-6">
              Built for creative professionals
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              Your creative business, finally organized
            </h1>
            <p className="text-xl text-zinc-600 mb-10 max-w-2xl">
              Clients, projects, invoicing, and feedback — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-12">
              <Link href="/sign-up" className={buttonVariants({ variant: "default", size: "lg" })}>Start free</Link>
              <Link href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>See how it works</Link>
            </div>
            <p className="text-sm text-zinc-500 font-medium">
              Built for photographers, designers, video editors, and creative studios
            </p>
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="py-24 bg-zinc-50 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-none bg-white">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Client and project pipeline</CardTitle>
                  <CardDescription className="text-base">Every client and project in one clean, trackable view.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-none bg-white">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Invoicing that just works</CardTitle>
                  <CardDescription className="text-base">Sequential, organized, no manual number chasing.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-none bg-white">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Feedback in the workflow</CardTitle>
                  <CardDescription className="text-base">Client revisions and testimonials, right where the work lives.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-none shadow-none bg-white">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Room to grow</CardTitle>
                  <CardDescription className="text-base">Roles, assignment, and messaging for when you build a team.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">How it works</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xl">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Add your clients</h3>
                  <p className="text-zinc-600 text-lg">Bring your existing clients and projects into one dashboard.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xl">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Track the work</h3>
                  <p className="text-zinc-600 text-lg">Move projects through your pipeline and collect feedback.</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-xl">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Get paid</h3>
                  <p className="text-zinc-600 text-lg">Send invoices and keep every payment in view.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-24 bg-zinc-950 text-white text-center px-4">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Ready to get organized?</h2>
            <p className="text-xl text-zinc-400 mb-10">Start free, no card required.</p>
            <Link href="/sign-up" className={buttonVariants({ variant: "default", size: "lg", className: "bg-white text-zinc-950 hover:bg-zinc-100" })}>Start free</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-100 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>© Cutline</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-zinc-950 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-zinc-950 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
