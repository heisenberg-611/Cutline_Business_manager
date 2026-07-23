import { requireAdmin } from '../actions';
import { getGlobalSettings } from './actions';
import { SettingsForm } from './components/SettingsForm';

export const metadata = {
  title: 'Platform Settings',
};

export default async function AdminSettingsPage() {
  await requireAdmin(); // SECURITY CHECK
  
  const settings = await getGlobalSettings();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Platform Settings</h2>
        <p className="text-sm text-zinc-500">Configure global platform details, quotas, trials, and payment instructions.</p>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
