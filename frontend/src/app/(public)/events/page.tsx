'use client';

import React, { useState, useEffect } from 'react';
import EventCard from '@/components/common/EventCard';
import type { Event } from '@/lib/api';
import { getUpcomingEvents } from '@/lib/api';
import { Search, Calendar, MapPin, SlidersHorizontal } from 'lucide-react';

export default function EventsDiscoveryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('Date (Soonest)');

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getUpcomingEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Filter items
  const categories = ['All', 'Technology', 'Education', 'Design', 'Business'];
  
  // Extract unique locations from events list
  const locations = ['All', ...Array.from(new Set(events.map(e => e.locationShort || e.location.split(',')[0])))];

  const statuses = ['All', 'Upcoming', 'Past', 'Live'];
  const sortOptions = ['Date (Soonest)', 'Date (Latest)', 'Name (A-Z)'];

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category mapping logic helper
      const getEventCategory = (e: Event) => {
        if (e.slug.includes('tech')) return 'Technology';
        if (e.slug.includes('knowledge') || e.slug.includes('fiesta')) return 'Education';
        if (e.slug.includes('design') || e.slug.includes('ui-ux')) return 'Design';
        return 'Business';
      };

      const eventCategory = getEventCategory(event);
      const matchesCategory = selectedCategory === 'All' || eventCategory === selectedCategory;

      const locShort = event.locationShort || event.location.split(',')[0];
      const matchesLocation = selectedLocation === 'All' || locShort === selectedLocation;

      // Status filter logic
      const isPast = new Date(event.date) < new Date();
      const isEventLive = event.status === 'LIVE' || event.slug.includes('gregorian') || event.slug.includes('tech');
      
      let eventComputedStatus = 'Upcoming';
      if (isEventLive) eventComputedStatus = 'Live';
      else if (isPast) eventComputedStatus = 'Past';

      const matchesStatus = selectedStatus === 'All' || eventComputedStatus === selectedStatus;

      return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'Date (Soonest)') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOrder === 'Date (Latest)') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortOrder === 'Name (A-Z)') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className="flex flex-col min-h-screen bg-background">

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* Title and Intro */}
        <section className="mb-10 text-center md:text-left">
          <h1 className="text-headline-lg text-foreground font-extrabold m-0">
            Explore Upcoming Events
          </h1>
          <p className="text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Discover conferences, seminars, workshops, and competitions hosted by community organizers near you.
          </p>
        </section>

        {/* Filter bar */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 mb-10 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
              <Search className="w-5 h-5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by title, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-on-surface-variant"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
              <SlidersHorizontal className="w-5 h-5 text-on-surface-variant" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-foreground cursor-pointer focus:ring-0"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface-container-lowest">
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
              <MapPin className="w-5 h-5 text-on-surface-variant" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-foreground cursor-pointer focus:ring-0"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-surface-container-lowest">
                    Location: {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Status Select */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
              <Calendar className="w-5 h-5 text-on-surface-variant" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-foreground cursor-pointer focus:ring-0"
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-surface-container-lowest">
                    Status: {s}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
              <SlidersHorizontal className="w-5 h-5 text-on-surface-variant" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-foreground cursor-pointer focus:ring-0"
              >
                {sortOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-surface-container-lowest">
                    Sort by: {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Bento Events Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body-sm text-on-surface-variant">Loading event catalog...</span>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const getEventCategory = (e: Event) => {
                if (e.slug.includes('tech')) return 'Technology';
                if (e.slug.includes('knowledge') || e.slug.includes('fiesta')) return 'Education';
                if (e.slug.includes('design') || e.slug.includes('ui-ux')) return 'Design';
                return 'Business';
              };
              return (
                <div key={event.slug} className="h-full">
                  <EventCard
                    event={event}
                    category={getEventCategory(event)}
                    isLive={event.slug.includes('gregorian') || event.slug.includes('tech')}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-xs">
            <Calendar className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
            <h3 className="text-headline-md font-extrabold text-foreground m-0">No Events Found</h3>
            <p className="text-body-sm text-on-surface-variant mt-3 max-w-md mx-auto">
              We couldn't find any events matching your current search parameters. Try adjusting your query or resetting your filters.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLocation('All');
                setSelectedStatus('All');
                setSortOrder('Date (Soonest)');
              }}
              className="mt-6 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer border-none"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

    </div>
  );
}
