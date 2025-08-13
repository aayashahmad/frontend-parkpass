import Hero from '@/components/home/Hero';
import DistrictSelection from '@/components/home/DistrictSelection';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <DistrictSelection />
      <section className="py-16 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-300 to-blue-400 rounded-full opacity-20 animate-float"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center animate-fadeInUp">
            <h2 className="text-5xl font-heading font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
              🌟 Welcome to ParkPass
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Discover and book tickets to the most beautiful parks in your area.
                ParkPass makes it easy to plan your outdoor adventures with just a few clicks. ✨
              </p>
              <p className="text-lg text-gray-600 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
                Select your district, choose a park, and book your tickets online.
                It's that simple! 🎫
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent animate-fadeInDown">
            🚀 How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Select Your District</h3>
                <p className="text-gray-600">Choose your district from the dropdown menu to see available parks in your area.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Book Your Tickets</h3>
                <p className="text-gray-600">Select the number of adults and children, and proceed to payment.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Enjoy Your Visit</h3>
                <p className="text-gray-600">Download or print your tickets and present them at the park entrance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold text-white mb-4">
              🔐 Admin & Staff Access
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Access the admin panel to manage parks, bookings, and validate tickets
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Admin Login */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Admin Panel</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Manage parks, districts, and view analytics
                </p>
                <a
                  href="/admin"
                  className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  Admin Login
                </a>
              </div>

              {/* Ticket Checker */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ticket Scanner</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Scan and validate visitor tickets at park entrance
                </p>
                <a
                  href="/admin/ticket-checker"
                  className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Scan Tickets
                </a>
              </div>

              {/* Test Booking */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Test Booking</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Create test bookings and test payment flow
                </p>
                <a
                  href="/test-booking"
                  className="inline-block bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                >
                  Test System
                </a>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-blue-100 text-sm">
                <strong>Quick Access:</strong> Admin Panel for management • Ticket Scanner for validation • Test Booking for development
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}