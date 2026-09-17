'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppleCard from '@/components/common/AppleCard';
import ScrollRow from '@/components/common/ScrollRow';
import type { Event } from '@/lib/api';
import { fetchEventsPaginated } from '@/lib/api';
import { Search, Calendar, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';

export default function EventsDiscoveryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('Date (Soonest)');

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const loadInitialEvents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchEventsPaginated({
        limit: 12,
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
      });
      setEvents(result.data);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load initial events:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    loadInitialEvents();
  }, [loadInitialEvents]);

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchEventsPaginated({
        limit: 12,
        cursor: nextCursor,
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
      });
      setEvents((prev) => [...prev, ...result.data]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Failed to load more events:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, nextCursor, loadingMore, searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreEvents();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [observerTarget, hasMore, loadingMore, loadMoreEvents]);

  const getEventCategory = (e: Event) => {
    if (e.category) return e.category.split(',')[0].trim();
    return 'Tech'; // Default fallback
  };

  const categoryOrder = [
    'Tech',
    'Business',
    'Health & Fitness',
    'Environment & Climate',
    'Education',
    'Culture & Arts',
    'Entertainment',
    'Sports',
    'Design & Architecture',
    'Productivity',
    'Personal Development'
  ];

  const activeCategories = Array.from(new Set(events.map(getEventCategory)))
    .filter(Boolean)
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        !searchQuery ||
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());

      const eventCategory = getEventCategory(event);
      const matchesCategory = selectedCategory === 'All' || eventCategory === selectedCategory;

      const locShort = event.locationShort || event.location.split(',')[0];
      const matchesLocation = selectedLocation === 'All' || locShort === selectedLocation;

      const isPast = new Date(event.date) < new Date();
      const isEventLive = event.status === 'LIVE' || event.slug.includes('gregorian') || event.slug.includes('tech');

      let eventComputedStatus = 'Upcoming';
      if (isEventLive) eventComputedStatus = 'Live';
      else if (isPast) eventComputedStatus = 'Past';

      // Hide ended/past events from the discovery catalog completely
      if (eventComputedStatus === 'Past' || event.status === 'ENDED' || event.status === 'PAST') return false;

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
        <section className="relative overflow-hidden w-full min-h-fit flex flex-col items-center justify-start bg-[#fafafa] -mt-16 pt-24 pb-4 md:pt-36 md:pb-8">
          <div className="absolute inset-0 bg-hero-gradient dark:bg-hero-gradient-dark pointer-events-none z-0" />
          <div className="absolute inset-0 hero-grid opacity-60 dark:opacity-30 pointer-events-none z-0" />

          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#2BA361]/[0.05] blur-[100px] pointer-events-none z-0" />
          <div className="absolute top-1/4 -left-40 w-80 h-80 rounded-full bg-[#2BA361]/[0.04] blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-1/4 -right-40 w-80 h-80 rounded-full bg-[#F7BB16]/[0.05] blur-3xl pointer-events-none z-0" />

          <div className="absolute bottom-0 left-0 right-0 h-24 md:h-36 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

          <div className="w-full px-6 md:px-24 py-8 md:py-16 text-left z-10 relative">
            <h1 className="text-display-ticket text-foreground mb-6">
              Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Events</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-2xl mb-10 leading-relaxed font-sans">
              Discover conferences, seminars, workshops and competitions organized by community organizers.
            </p>
          </div>
        </section>

        <div className="w-full py-10">
          {/* Categorized Events Rows */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body-sm text-on-surface-variant">Loading event catalog...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="flex flex-col space-y-16 mt-8">
              {activeCategories.map((category) => {
                const categoryEvents = filteredEvents
                  .filter((e) => getEventCategory(e) === category)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (categoryEvents.length === 0) return null;

                return (
                  <section key={category} className="overflow-hidden">
                    <div className="px-6 md:px-24 mb-6">
                      <h2 className="m-0 text-[28px] md:text-[36px] font-extrabold tracking-tight" style={{ color: '#1d1d1f' }}>
                        {category} events.{' '}
                        <span style={{ color: '#6e6e73' }}>
                          {
                            {
                              Tech: 'Explore the latest in innovation, coding and future technologies.',
                              Business: 'Discover insights on entrepreneurship, markets and finance.',
                              'Health & Fitness': 'Join activities focused on wellness and healthy living.',
                              'Environment & Climate': 'Participate in sustainability and eco friendly initiatives.',
                              Education: 'Enhance your skills and knowledge with learning sessions.',
                              'Culture & Arts': 'Immerse yourself in creative expressions and cultural heritage.',
                              Entertainment: 'Enjoy concerts, festivals and fun gatherings.',
                              Sports: 'Connect with athletic competitions and team activities.',
                              'Design & Architecture': 'Dive into aesthetics, user experience and structure of architecture.',
                              Productivity: 'Learn how to optimize your time and workflow.',
                              'Personal Development': 'Focus on self growth and career advancement.',
                            }[category] || `Explore what's happening now in ${category}.`
                          }
                        </span>
                      </h2>
                    </div>
                    <ScrollRow className="px-6 md:px-24 gap-6 py-6">
                      {categoryEvents.map((event) => (
                        <AppleCard key={event.slug} event={event} />
                      ))}
                    </ScrollRow>
                  </section>
                );
              })}

              {/* Infinite scroll loader / trigger */}
              <div ref={observerTarget} className="flex flex-col items-center justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more events...</span>
                  </div>
                )}
                {!hasMore && events.length > 0 && (
                  <span className="text-xs text-on-surface-variant/60 font-medium">You've reached the end of the event catalog.</span>
                )}
              </div>
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
