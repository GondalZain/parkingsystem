'use client';

import { ArrowLeft, Mail, Phone, RotateCcw, Clock, CheckCircle, Shield, CreditCard, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicy() {
  const refundSteps = [
    {
      step: 1,
      title: 'Submit Request',
      description: 'Email us with your booking details',
      icon: Mail,
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: 2,
      title: 'Quick Review',
      description: 'We verify your eligibility instantly',
      icon: Zap,
      color: 'from-amber-500 to-orange-500'
    },
    {
      step: 3,
      title: 'Refund Processed',
      description: 'Money back to your account',
      icon: CreditCard,
      color: 'from-emerald-500 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 mb-8 text-emerald-100 hover:text-white transition-all duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm font-semibold">Hassle-Free Returns</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Refund Policy
              </h1>
              <p className="text-emerald-100 text-lg md:text-xl max-w-xl">
                We believe in keeping things simple. If plans change, we've got your back with our straightforward refund process.
              </p>
            </div>
            
            {/* Trust Badge */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 text-emerald-300" />
                <span className="text-2xl font-bold">100%</span>
              </div>
              <p className="text-emerald-100 text-sm">Money Back Guarantee<br />within refund window</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Quick Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 -mt-16 relative z-10 mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Before Session</h3>
            <p className="text-gray-600">Request anytime before your parking session starts for a full refund.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">10-Minute Grace</h3>
            <p className="text-gray-600">Changed your mind? Request within 10 minutes after session starts.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Questions Asked</h3>
            <p className="text-gray-600">We process eligible refunds quickly without complicated procedures.</p>
          </div>
        </div>

        {/* Main Message Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 mb-16 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Plans Change. We Get It.</h2>
            <p className="text-emerald-100 text-lg md:text-xl max-w-2xl leading-relaxed">
              Whether it's a schedule conflict, no spots available, or any other reason — we're here to make things right with our simple refund process.
            </p>
          </div>
        </div>

        {/* How It Works - Process Steps */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How to Get Your Refund</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Three simple steps to get your money back</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {refundSteps.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector Line */}
                {index < refundSteps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent -translate-x-4 z-0"></div>
                )}
                
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-5xl font-bold text-gray-100">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Window Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Before Session */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Before Session Starts</h3>
                  <p className="text-emerald-100">Full refund guaranteed</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Cancel anytime before your scheduled parking time</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">100% of your payment returned</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">No cancellation fees</span>
                </li>
              </ul>
            </div>
          </div>

          {/* After Session Starts */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">10-Minute Grace Period</h3>
                  <p className="text-blue-100">Quick change of plans</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Request within 10 minutes of session start</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Full refund still available</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Perfect for last-minute changes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-amber-200 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Important Information</h3>
              <p className="text-gray-700 leading-relaxed">
                Refund eligibility is determined by the time of your request relative to your parking session. To ensure you're within the refund window, please contact us as soon as you know you won't need your spot. Include your booking reference number for faster processing.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-16">
          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Request Your Refund</h2>
              <p className="text-gray-600 text-lg">Reach out to us through any of these channels</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Card */}
              <a 
                href="mailto:detroitparkingllc@gmail.com"
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Email Us</p>
                    <p className="text-lg font-bold text-gray-900">Preferred Method</p>
                  </div>
                </div>
                <p className="text-emerald-600 font-semibold text-lg group-hover:text-emerald-700 flex items-center gap-2">
                  detroitparkingllc@gmail.com
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </p>
              </a>

              {/* Phone Card */}
              <a 
                href="tel:+15138795163"
                className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Call Us</p>
                    <p className="text-lg font-bold text-gray-900">Speak Directly</p>
                  </div>
                </div>
                <p className="text-blue-600 font-semibold text-lg group-hover:text-blue-700 flex items-center gap-2">
                  +1 (513) 879-5163
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 -translate-y-1/3"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-semibold">Customer First Policy</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">No Sweat. We've Got You Covered.</h2>
          <p className="text-emerald-100 mb-8 text-lg max-w-2xl mx-auto">
            Our refund policy is designed with your convenience in mind. Simple, fast, and fair.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+15138795163"
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Phone className="w-5 h-5" />
              Call Us Now
            </a>
            <a
              href="mailto:detroitparkingllc@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500/30 backdrop-blur-sm hover:bg-emerald-500/40 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-0.5"
            >
              <Mail className="w-5 h-5" />
              Email Support
            </a>
          </div>
        </div>
      </div>

      {/* Back to Home Footer */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <p className="text-gray-500 text-sm">© 2026 Detroit Parking LLC. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
