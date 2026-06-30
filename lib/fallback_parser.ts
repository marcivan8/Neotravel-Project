export interface ParsedTravelRequest {
  origine: string
  destination: string
  nb_passagers: number
  date_depart: string
  aller_retour: boolean
}

export function parseTravelRequest(lastUserMessage: string): ParsedTravelRequest {
  let origine = 'Paris'
  let destination = 'Lyon'

  const knownCities = [
    'versailles', 'annecy', 'la baule', 'avignon', 'bruxelles', 
    'saint-émilion', 'saint emilion', 'paris', 'lyon', 'marseille', 
    'nantes', 'lille', 'bordeaux', 'toulouse'
  ]
  const found: { name: string; index: number }[] = []
  for (const city of knownCities) {
    const idx = lastUserMessage.toLowerCase().indexOf(city)
    if (idx !== -1) {
      found.push({
        name: city === 'saint emilion' ? 'Saint-Émilion' : city.charAt(0).toUpperCase() + city.slice(1),
        index: idx,
      })
    }
  }
  found.sort((a, b) => a.index - b.index)

  if (found.length >= 2) {
    origine = found[0].name
    destination = found[1].name
  } else if (found.length === 1) {
    origine = found[0].name
    destination = found[0].name === 'Paris' ? 'Lyon' : 'Paris'
  }

  let nb_passagers = 45
  const paxMatch = lastUserMessage.match(/(\d+)\s*(?:passagers|élèves|personnes|pax|joueurs|membres|voyageurs)?/i)
  if (paxMatch) {
    const parsed = parseInt(paxMatch[1], 10)
    if (parsed > 0 && parsed <= 85) {
      nb_passagers = parsed
    }
  }

  let date_depart = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const dateMatch = lastUserMessage.match(/(\d{1,2})[\/\.-](\d{1,2})(?:[\/\.-](\d{2,4}))?/)
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10)
    const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear()
    const fullYear = year < 100 ? 2000 + year : year
    date_depart = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const lowerMsg = lastUserMessage.toLowerCase()
  const aller_retour = lowerMsg.includes('aller-retour') || 
                       lowerMsg.includes('aller retour') || 
                       lowerMsg.includes('a/r') || 
                       lowerMsg.includes(' ar ') || 
                       lowerMsg.endsWith(' ar') ||
                       lowerMsg.startsWith('ar ') ||
                       lowerMsg.includes('retour')

  return {
    origine,
    destination,
    nb_passagers,
    date_depart,
    aller_retour,
  }
}
