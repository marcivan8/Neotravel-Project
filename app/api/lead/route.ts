import { NextResponse } from 'next/server'
import { createLead, createOpportunite } from '@/lib/airtable'

// ─────────────────────────────────────────────
// POST /api/lead
// Form fallback — called by /form page.
// Creates a Lead + initial Opportunite in Airtable.
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      nom,
      email,
      telephone,
      origine,
      destination,
      date_depart,
      nb_passagers,
      type_vehicule,
      options,
      urgence,
    } = body

    // Validate required fields
    if (!nom || !email || !origine || !destination || !date_depart || !nb_passagers) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants : nom, email, origine, destination, date_depart, nb_passagers' },
        { status: 400 }
      )
    }

    const parsedPax = Number(nb_passagers)
    if (!Number.isInteger(parsedPax) || parsedPax < 1 || parsedPax > 200) {
      return NextResponse.json(
        { success: false, error: 'nb_passagers doit être un entier entre 1 et 200' },
        { status: 400 }
      )
    }

    // ── 1. Create Lead (contact info) ────────────
    const leadId = await createLead({ nom, email, telephone })

    // ── 2. Create initial Opportunite (journey details, no price yet) ──
    const isUrgent =
      urgence === true ||
      urgence === 'true' ||
      (date_depart
        ? (new Date(date_depart).getTime() - Date.now()) / 86_400_000 < 7
        : false)

    const opportuniteId = await createOpportunite(leadId, {
      nombre_passagers: parsedPax,
      distance_km:      0,    // unknown until calculer_devis runs
      prix_total:       0,    // unknown until devis generated
      urgence:          isUrgent ? 'Urgente' : 'Normale',
    })

    console.log(
      `[POST /api/lead] Lead ${leadId} + Opportunite ${opportuniteId} created for ${email}`
    )

    return NextResponse.json({
      success:        true,
      lead_id:        leadId,
      opportunite_id: opportuniteId,
      message:        'Demande enregistrée. Nous vous envoyons votre devis très rapidement.',
    })
  } catch (err) {
    console.error('[POST /api/lead] Error:', err)
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    )
  }
}
