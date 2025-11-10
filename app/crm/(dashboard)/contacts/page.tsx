import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users } from 'lucide-react'

export default function CrmContactsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Contacts</h1>
        <p className="text-sm text-slate-600">
          Search, filter, and assign prospects to advisors. This view will grow into a tabbed table with saved filters and bulk actions.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Users className="h-5 w-5 text-slate-500" />
              Contact Directory
            </CardTitle>
            <CardDescription>
              Start with a data table using TanStack or the shadcn table component. Back it with Prisma pagination and filters.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/crm/contacts/new">Add contact</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>• Columns: Name, Phone, Stage, Owner, Last Touch, Next Task, Source.</p>
          <p>• Quick filters for campus, source, and tour status.</p>
          <p>• Bulk actions to assign, add to nurture sequences, or export.</p>
        </CardContent>
      </Card>

      <Card className="border-dashed border-slate-300">
        <CardHeader>
          <CardTitle>Follow-up actions</CardTitle>
          <CardDescription>Cursor prompt ideas once the table exists</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• “Generate a server action to merge duplicate contacts by email.”</p>
          <p>• “Create a bulk stage update action with optimistic UI.”</p>
          <p>• “Add a side panel drawer with contact details and timeline preview.”</p>
        </CardContent>
      </Card>
    </div>
  )
}
