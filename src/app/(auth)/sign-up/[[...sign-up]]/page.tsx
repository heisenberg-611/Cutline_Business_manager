import { SignUp } from "@clerk/nextjs"
import prisma from "@/modules/core/db/prisma"
import Link from "next/link"

export default async function SignUpPage() {
  const settings = await prisma.globalSettings.findUnique({
    where: { id: 'default' }
  });

  if (settings && settings.allowNewSignups === false) {
    return (
      <div className="w-full mx-auto max-w-md bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-white/10 shadow-2xl shadow-indigo-500/5 rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-zinc-900 dark:text-zinc-100 font-bold tracking-tight text-2xl">Registrations Closed</h1>
        <p className="text-zinc-500">
          We are currently not accepting new registrations at this time.
        </p>
        <div className="pt-4 border-t border-zinc-200 dark:border-white/10 mt-6">
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SignUp 
      fallbackRedirectUrl="/dashboard"
      signInUrl="/login"
      appearance={{
        elements: {
          rootBox: "w-full mx-auto flex justify-center",
          card: "bg-white dark:bg-[#0f0f0f] border border-zinc-200 dark:border-white/10 shadow-2xl shadow-indigo-500/5 rounded-2xl w-full",
          headerTitle: "text-zinc-900 dark:text-zinc-100 font-bold tracking-tight text-xl",
          headerSubtitle: "text-zinc-500",
          socialButtonsBlockButton: "border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors",
          socialButtonsBlockButtonText: "font-medium",
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white transition-colors border-none shadow-sm shadow-indigo-500/20",
          formFieldLabel: "text-zinc-700 dark:text-zinc-300 font-medium",
          formFieldInput: "bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg",
          footerActionLink: "text-indigo-600 hover:text-indigo-500 font-medium",
          dividerLine: "bg-zinc-200 dark:bg-white/10",
          dividerText: "text-zinc-400",
          identityPreviewText: "text-zinc-900 dark:text-zinc-100",
          identityPreviewEditButtonIcon: "text-indigo-500",
        }
      }}
    />
  )
}
