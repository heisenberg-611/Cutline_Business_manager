'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

declare global {
  interface Window {
    OneSignalDeferred: any[];
    OneSignal: any;
  }
}

export function OneSignalInit() {
  const { user, isLoaded } = useUser();
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const hasShownDialog = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      if (user) {
        await OneSignal.login(user.id);
      } else {
        await OneSignal.logout();
      }
    });
  }, [user, isLoaded]);

  useEffect(() => {
    let mounted = true;

    const evaluateSubscriptionId = (id: string | null | undefined) => {
      if (id && !id.startsWith('local-')) {
        if (!hasShownDialog.current && mounted) {
          hasShownDialog.current = true;
          setShowVerificationDialog(true);
        }
      }
    };

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function(OneSignal: any) {
      // Check if we've already permanently dismissed the custom dialog
      const hasDismissed = localStorage.getItem('onesignal-prompt-dismissed') === 'true';
      
      if (hasDismissed) return;

      // Show dialog if not opted in yet
      if (!OneSignal.Notifications.permission) {
        if (!hasShownDialog.current && mounted) {
          hasShownDialog.current = true;
          setShowVerificationDialog(true);
        }
      } else {
        // If they already have permission, check if we have a real ID
        if (OneSignal.User && OneSignal.User.PushSubscription) {
          evaluateSubscriptionId(OneSignal.User.PushSubscription.id);
        }
      }

      // Ensure that when the tab is open, we manually display a beautiful Toast notification!
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', function(event: any) {
        event.preventDefault(); // Stop native browser push which might be suppressed by OS anyway

        const notification = event.notification;
        const title = notification.title || "New Notification";
        const body = notification.body || "";
        
        toast.info(title, {
          description: body,
          action: notification.url ? {
            label: "View",
            onClick: () => window.location.href = notification.url
          } : undefined,
          duration: 8000,
        });
      });

      const changeHandler = () => {
        if (OneSignal.User && OneSignal.User.PushSubscription) {
          evaluateSubscriptionId(OneSignal.User.PushSubscription.id);
        }
      };
      
      if (OneSignal.User && OneSignal.User.PushSubscription) {
        OneSignal.User.PushSubscription.addEventListener('change', changeHandler);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!showVerificationDialog) {
    return null;
  }

  return (
    <>

      {showVerificationDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">
              Your OneSignal SDK integration is complete!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-6">
              You can now send Push Notifications & In-App Messages through OneSignal. Tap below to enable push notifications.
            </p>
            <button
              onClick={() => {
                setShowVerificationDialog(false);
                localStorage.setItem('onesignal-prompt-dismissed', 'true');
                window.OneSignalDeferred.push(async function(OneSignal: any) {
                  await OneSignal.Notifications.requestPermission();
                });
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

