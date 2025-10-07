import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    business: 'Bella Salon & Spa',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    text: "BookAny transformed how we manage appointments. The AI chat feature handles 80% of our bookings automatically, and our no-show rate dropped by 60% with the smart reminder system."
  },
  {
    name: 'Michael Chen',
    business: 'Urban Fitness Studio',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    text: "The multi-business feature is incredible. I manage 3 gym locations from one dashboard, each with custom branding. The analytics help me optimize class schedules and maximize revenue."
  },
  {
    name: 'Emily Rodriguez',
    business: 'Gourmet Bistro',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    text: "Our restaurant bookings increased 40% since switching to BookAny. The seamless mobile experience and instant confirmations keep our customers happy and coming back."
  },
  {
    name: 'David Park',
    business: 'Legal Consultancy',
    image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    text: "Professional, secure, and reliable. The platform handles all our client appointments flawlessly, and the integration with our calendar system saves us hours every week."
  },
  {
    name: 'Lisa Thompson',
    business: 'Pet Grooming Plus',
    image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    text: "The custom branding options made our booking page feel like a natural extension of our website. Clients love how easy it is to book appointments on their phones."
  },
  {
    name: 'James Wilson',
    business: 'Auto Service Center',
    image: 'https://images.pexels.com/photos/1080213/pexels-photo-1080213.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 5,
    text: "BookAny streamlined our entire booking process. The service management features help us track different maintenance types, and the payment integration is seamless."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands of Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See what business owners are saying about how BookAny has transformed 
            their reservation management and customer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.business}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                  <Star key={starIndex} size={16} className="text-yellow-400 fill-current" />
                ))}
              </div>

              <div className="relative">
                <Quote size={20} className="text-gray-300 absolute -top-2 -left-2" />
                <p className="text-gray-700 italic pl-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 text-gray-600">
            <div className="flex items-center space-x-2">
              <Star size={20} className="text-yellow-400 fill-current" />
              <span className="font-semibold">4.9/5</span>
              <span>Average Rating</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <span className="font-semibold">10,000+</span> Happy Customers
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <span className="font-semibold">50+</span> Business Types
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}