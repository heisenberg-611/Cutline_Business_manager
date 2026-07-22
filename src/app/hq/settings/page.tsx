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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Platform Settings</h2>
        <p className="text-sm text-zinc-500">Configure global platform details, including payment instructions shown to users.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-6">Payment Configuration</h3>
        <SettingsForm initialData={settings} />
      </div>
    </div>
  );
}
