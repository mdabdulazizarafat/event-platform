import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[100px] sm:text-[120px] font-bold text-primary leading-none mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-4">
        This page could not be found.
      </h2>
      <p className="text-on-surface-variant max-w-md mx-auto mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        href="/"
        className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary-600 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
}
