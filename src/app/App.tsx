import { useState } from 'react'
import { ProfileProvider } from '../lib/ProfileContext'
import { CommunitiesProvider } from '../lib/CommunitiesContext'

import { SocialHub } from './components/SocialHub'
import { EventsPage } from './components/EventsPage'
import { EventDetailPage } from './components/EventDetailPage'

type Page =
  | 'home'
  | 'social-hub'
  | 'events'
  | 'event-detail'

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const navigateToEvents = () => {
    setCurrentPage('events')
  }

  const navigateToEventDetail = (eventId: string) => {
    setSelectedEventId(eventId)
    setCurrentPage('event-detail')
  }

  const navigateHome = () => {
    setCurrentPage('home')
  }

  return (
    <ProfileProvider>
      <CommunitiesProvider>
        {currentPage === 'home' && (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <button
              onClick={() => setCurrentPage('social-hub')}
              className="px-6 py-3 bg-black text-white rounded-lg"
            >
              Entrar
            </button>
          </div>
        )}

        {currentPage === 'social-hub' && (
          <SocialHub
            onNavigateToEvents={navigateToEvents}
          />
        )}

        {currentPage === 'events' && (
          <EventsPage
            onNavigateHome={navigateHome}
            onNavigateToEventDetail={navigateToEventDetail}
          />
        )}

        {currentPage === 'event-detail' && selectedEventId && (
          <EventDetailPage
            eventId={selectedEventId}
            onBack={navigateToEvents}
          />
        )}
      </CommunitiesProvider>
    </ProfileProvider>
  )
}