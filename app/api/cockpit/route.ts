import { NextResponse } from 'next/server'
import { getLeadsForCockpit, updateLeadStatusInAirtable } from '@/lib/airtable'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const leads = await getLeadsForCockpit()
    return NextResponse.json({ success: true, leads })
  } catch (err) {
    console.error('[GET /api/cockpit] Error:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { leadId, status } = await req.json()

    if (!leadId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing leadId or status parameter' },
        { status: 400 }
      )
    }

    await updateLeadStatusInAirtable(leadId, status)
    console.log(`[PATCH /api/cockpit] Updated lead ${leadId} status to ${status}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/cockpit] Error:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}
