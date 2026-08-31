'use client';

import React, { useState, useEffect } from 'react';
import AppleCard from '@/components/common/AppleCard';
import ScrollRow from '@/components/common/ScrollRow';
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

      <main className="flex-1 w-full mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-32 pb-8 md:pt-36">
          {/* Background layers */}
          <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
          <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

          {/* Ambient glow orbs */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
          <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

          {/* Bottom gradient fade to blend hero bg with main page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

          <div className="max-w-7xl mx-auto px-6 py-16 text-center z-10 relative">
            <h1 className="text-display-ticket text-foreground mb-6">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Upcoming Events</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
              Discover conferences, seminars, workshops and competitions organized by community organizers.
            </p>
          </div>
        </section>

        <div className="w-full py-10">

          {/* Filter bar 
        <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 mb-10 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input
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

            {/* Category Select 
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

            {/* Location Select 
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
             {/* Status Select
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
            
            {/* Sort Select 
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
        </section>*/}

          {/* Categorized Events Rows */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body-sm text-on-surface-variant">Loading event catalog...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="flex flex-col space-y-16 mt-8">
              {['Technology', 'Education', 'Design', 'Business'].map((category) => {
                const getEventCategory = (e: Event) => {
                  if (e.slug.includes('tech')) return 'Technology';
                  if (e.slug.includes('knowledge') || e.slug.includes('fiesta')) return 'Education';
                  if (e.slug.includes('design') || e.slug.includes('ui-ux')) return 'Design';
                  return 'Business';
                };

                const categoryEvents = filteredEvents.filter(e => getEventCategory(e) === category);

                if (categoryEvents.length === 0) return null;

                return (
                  <section key={category} className="overflow-hidden">
                    <div className="px-6 md:px-24 mb-6">
                      <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: '#1d1d1f' }}>
                        {category} Events.
                      </h2>
                    </div>
                    <ScrollRow className="px-6 md:px-24 gap-6 pb-4">
                      {categoryEvents.map((event) => (
                        <AppleCard key={event.slug} event={event} />
                      ))}
                    </ScrollRow>
                  </section>
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
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
