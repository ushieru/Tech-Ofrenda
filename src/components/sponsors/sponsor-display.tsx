'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { sponsorLevelLabels, sponsorLevelColors } from '@/lib/validations/sponsor'

interface Sponsor {
  id: string
  name: string
  website: string | null
  logo: string | null
  level: keyof typeof sponsorLevelLabels
}

interface SponsorDisplayProps {
  sponsors: Sponsor[]
  title?: string
}

export function SponsorDisplay({ sponsors, title = "Nuestros Sponsors" }: SponsorDisplayProps) {
  if (sponsors.length === 0) {
    return null
  }

  // Group sponsors by level for better display
  const sponsorsByLevel = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.level]) {
      acc[sponsor.level] = []
    }
    acc[sponsor.level].push(sponsor)
    return acc
  }, {} as Record<string, Sponsor[]>)

  // Order levels by importance
  const levelOrder = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'] as const

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-orange-800 mb-6">
        {title}
      </h2>

      {levelOrder.map((level) => {
        const levelSponsors = sponsorsByLevel[level]
        if (!levelSponsors || levelSponsors.length === 0) return null

        return (
          <div key={level} className="space-y-4">
            <div className="text-center">
              <Badge 
                className={`text-white text-lg px-4 py-2 ${sponsorLevelColors[level]}`}
              >
                {sponsorLevelLabels[level]}
              </Badge>
            </div>

            <div className={`grid gap-4 ${
              level === 'PLATINUM' ? 'grid-cols-1 md:grid-cols-2' :
              level === 'GOLD' ? 'grid-cols-2 md:grid-cols-3' :
              'grid-cols-2 md:grid-cols-4'
            }`}>
              {levelSponsors.map((sponsor) => (
                <Card 
                  key={sponsor.id} 
                  className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                >
                  {sponsor.website ? (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center group"
                    >
                      <SponsorContent sponsor={sponsor} level={level} />
                    </a>
                  ) : (
                    <div className="text-center">
                      <SponsorContent sponsor={sponsor} level={level} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SponsorContent({ sponsor, level }: { sponsor: Sponsor; level: string }) {
  const logoSize = {
    PLATINUM: 'h-20 w-20',
    GOLD: 'h-16 w-16', 
    SILVER: 'h-12 w-12',
    BRONZE: 'h-10 w-10'
  }[level] || 'h-12 w-12'

  return (
    <>
      {sponsor.logo ? (
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className={`${logoSize} object-contain mx-auto mb-2 group-hover:scale-105 transition-transform`}
        />
      ) : (
        <div className={`${logoSize} bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2`}>
          <span className="text-gray-500 text-xs font-medium">
            {sponsor.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <h3 className={`font-medium text-gray-800 group-hover:text-orange-600 transition-colors ${
        level === 'PLATINUM' ? 'text-lg' :
        level === 'GOLD' ? 'text-base' :
        'text-sm'
      }`}>
        {sponsor.name}
      </h3>
    </>
  )
}