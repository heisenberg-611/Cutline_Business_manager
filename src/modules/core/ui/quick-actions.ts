export type QuickAction = {
  id: string
  label: string
  description: string
  href: string
}

export const ALL_QUICK_ACTIONS: QuickAction[] = [
  { 
    id: 'new-project', 
    label: 'New Project', 
    description: 'Start a new video editing project', 
    href: '/dashboard/projects?newProject=1'
  },
  { 
    id: 'create-invoice', 
    label: 'Create Invoice', 
    description: 'Bill a client for completed work', 
    href: '/dashboard/financials/new' 
  },
  { 
    id: 'new-client', 
    label: 'New Client', 
    description: 'Add a new client to your CRM', 
    href: '/dashboard/clients?newClient=1'
  },
  { 
    id: 'add-asset', 
    label: 'Add Asset', 
    description: 'Upload a new asset to your library', 
    href: '/dashboard/assets?newAsset=1'
  },
  { 
    id: 'record-expense', 
    label: 'Record Expense', 
    description: 'Log a new business expense', 
    href: '/dashboard/financials?tab=expenses&newExpense=1'
  },
]

export type QuickActionPreference = { 
  id: string
  visible: boolean 
}
