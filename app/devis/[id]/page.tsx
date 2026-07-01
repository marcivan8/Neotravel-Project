import * as fs from 'fs/promises'
import * as path from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const IconPrinter = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect width="12" height="8" x="6" y="14" />
  </svg>
)

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DevisPage({ params }: PageProps) {
  const { id } = await params

  let devisData: any = null
  try {
    const filePath = path.join(process.cwd(), 'public', 'devis', 'data', `${id}.json`)
    const rawData = await fs.readFile(filePath, 'utf-8')
    devisData = JSON.parse(rawData)
  } catch (err) {
    console.error(`[devis page] Error loading quote ${id}:`, err)
    return notFound()
  }

  const dateDepartStr = devisData.date_depart
    ? new Date(devisData.date_depart).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''
  
  const issueDateStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

  const validDateStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })

  const isAllerRetour = !!devisData.aller_retour
  const travelTypeStr = isAllerRetour ? 'Aller-retour' : 'Aller simple'
  const distanceStr = devisData.distance_km ? `${devisData.distance_km} km` : '—'
  const vehicleStr = devisData.type_vehicule ? String(devisData.type_vehicule) : 'Autocar Standard'
  
  let optionsStr = 'Aucune'
  if (Array.isArray(devisData.options) && devisData.options.length > 0) {
    optionsStr = devisData.options.join(', ')
  }

  const costPerPerson = devisData.devis.cout_par_personne ?? (Math.round((devisData.devis.prix_ttc / (devisData.nb_passagers || 1)) * 100) / 100)
  const pricingType = devisData.devis.type_tarification ?? 'Saison Basse'

  return (
    <div style={{ background: '#f5f5f3', minHeight: '100vh', padding: '32px 16px' }}>
      
      {/* CSS Styles for Print Optimization and Layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        .nt-devis-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
          padding: 48px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          font-family: 'Outfit', sans-serif;
          color: #1a2310;
        }

        .nt-devis-print-btn {
          background: #2e3a1f;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .nt-devis-print-btn:hover {
          background: #0f5c3a;
          transform: translateY(-1px);
        }

        .nt-devis-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
        }

        .nt-devis-table th {
          border-bottom: 2px solid #eceadf;
          padding: 12px 16px;
          text-align: left;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #616b57;
        }

        .nt-devis-table td {
          border-bottom: 1px solid #f1f0e8;
          padding: 16px;
          font-size: 14.5px;
        }

        .no-print {
          display: block;
        }

        @media print {
          body {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .nt-devis-container {
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Top action bar */}
      <div className="no-print" style={{ maxWidth: 800, margin: '0 auto 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#2e3a1f', fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Retour à l'accueil
        </Link>
        <a 
          className="nt-devis-print-btn"
          href="javascript:window.print()"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
        >
          <IconPrinter size={15} /> Imprimer ou Enregistrer en PDF
        </a>
      </div>

      {/* Main Quote Card Document */}
      <div className="nt-devis-container">
        
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2e3a1f', paddingBottom: 28, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color: '#2e3a1f', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: '#8ea31e', width: 28, height: 28, borderRadius: 6, display: 'inline-block' }}></span>
              NeoTravel
            </div>
            <div style={{ color: '#616b57', fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>
              Transport touristique & Voyages de groupes<br />
              142 Rue de Rivoli, 75001 Paris<br />
              devis@neotravel.fr · +33 1 84 60 70 80
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#2e3a1f', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Devis Commercial</h1>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f5c3a', marginTop: 4 }}>Réf : {id}</div>
          </div>
        </div>

        {/* Info Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#616b57', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #f1f0e8', paddingBottom: 4 }}>Destinataire</h3>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{devisData.prospect_nom}</div>
            <div style={{ fontSize: 13.5, color: '#555', marginTop: 4, lineHeight: 1.4 }}>
              Email : {devisData.prospect_email}<br />
              Réf Client : Client-{devisData.demande_id.slice(-6).toUpperCase()}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#616b57', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #f1f0e8', paddingBottom: 4 }}>Détails du Devis</h3>
            <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', color: '#666' }}>Date d'émission :</td>
                  <td style={{ padding: '3px 0', fontWeight: 500, textAlign: 'right' }}>{issueDateStr}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#666' }}>Date de validité :</td>
                  <td style={{ padding: '3px 0', fontWeight: 500, textAlign: 'right' }}>{validDateStr}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#666' }}>Statut :</td>
                  <td style={{ padding: '3px 0', fontWeight: 600, color: '#0f5c3a', textAlign: 'right' }}>Prêt à réserver</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trajet & Specifications Details */}
        <div style={{ background: '#fcfcf9', border: '1px solid #eceadf', borderRadius: 8, padding: 20, marginBottom: 40 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#2e3a1f', textTransform: 'uppercase', margin: '0 0 16px 0', borderBottom: '1px solid #f1f0e8', paddingBottom: 6 }}>
            Spécifications détaillées du Voyage
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px 16px' }}>
            <div>
              <span style={{ fontSize: 11, color: '#616b57', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Itinéraire</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2e3a1f', marginTop: 4 }}>{devisData.origine} → {devisData.destination}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#616b57', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type de trajet</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2e3a1f', marginTop: 4 }}>{travelTypeStr}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#616b57', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date de départ</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2e3a1f', marginTop: 4 }}>{dateDepartStr}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#616b57', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance estimée</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2e3a1f', marginTop: 4 }}>{distanceStr}</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#616b57', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre de passagers</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2e3a1f', marginTop: 4 }}>{devisData.nb_passagers} voyageurs</div>
            </div>
            <div>
              <span style={{ fontSize: 11, color: '#616b57', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Véhicule & Options</span>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2e3a1f', marginTop: 4 }}>
                {vehicleStr} {optionsStr !== 'Aucune' ? `(${optionsStr})` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#616b57', textTransform: 'uppercase', margin: 0 }}>Détail des Prestations</h3>
        <table className="nt-devis-table">
          <thead>
            <tr>
              <th style={{ width: '70%' }}>Description de la prestation</th>
              <th style={{ width: '30%', textAlign: 'right' }}>Montant HT</th>
            </tr>
          </thead>
          <tbody>
            {devisData.devis.lignes.map((line: any, idx: number) => (
              <tr key={idx}>
                <td>{line.libelle}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 500 }}>{line.montant.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pricing Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
          <div style={{ width: 340 }}>
            <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 0', color: '#616b57' }}>Type de tarification :</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, color: '#2e3a1f' }}>{pricingType}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eceadf' }}>
                  <td style={{ padding: '6px 0 10px', color: '#616b57' }}>Moyen par passager :</td>
                  <td style={{ padding: '6px 0 10px', textAlign: 'right', fontWeight: 700, color: '#0f5c3a' }}>{costPerPerson.toFixed(2)} € TTC</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0 6px', color: '#666', paddingTop: 10 }}>Total HT :</td>
                  <td style={{ padding: '8px 0 6px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 500, paddingTop: 10 }}>{devisData.devis.prix_ht.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#666', borderBottom: '1px solid #eceadf' }}>TVA (10%) :</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontFamily: 'monospace', fontWeight: 500, borderBottom: '1px solid #eceadf' }}>{devisData.devis.tva.toFixed(2)} €</td>
                </tr>
                <tr style={{ fontSize: 16, fontWeight: 700, color: '#2e3a1f' }}>
                  <td style={{ padding: '12px 0' }}>Total TTC :</td>
                  <td style={{ padding: '12px 0', textAlign: 'right', color: '#0f5c3a', fontFamily: 'monospace' }}>{devisData.devis.prix_ttc.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer legal notices */}
        <div style={{ borderTop: '1px solid #eceadf', marginTop: 56, paddingTop: 20, textAlign: 'center', fontSize: 11, color: '#9aa090', lineHeight: 1.5 }}>
          Ce devis est soumis aux conditions générales de vente de NeoTravel.<br />
          Pour confirmer votre réservation, veuillez accepter ce devis depuis notre assistant en ligne ou contacter notre service commercial.<br />
          NeoTravel SAS · TVA Intra FR 45 801 902 443 · RCS Paris B 801 902 443
        </div>

      </div>
    </div>
  )
}
