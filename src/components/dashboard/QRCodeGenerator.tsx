import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

export function QRCodeGenerator() {
  const { currentBusiness } = useBusiness();
  const [copied, setCopied] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    if (currentBusiness) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/book/${currentBusiness.id}`;
      setBookingUrl(url);
    }
  }, [currentBusiness]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${currentBusiness?.name || 'business'}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (!currentBusiness) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Please set up your business first to generate a QR code.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Code Booking</h2>
        <p className="text-gray-600">Generate a QR code for customers to easily book appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Booking QR Code</h3>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-100 inline-block">
              <QRCode
                id="qr-code"
                value={bookingUrl}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Customers can scan this code to book appointments instantly
            </p>
          </div>
        </div>

        {/* QR Code Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking URL</h3>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={bookingUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Share this URL directly or use the QR code for easy access
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadQR}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>Download QR Code</span>
              </button>
              <button
                onClick={() => window.open(bookingUrl, '_blank')}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 size={20} />
                <span>Preview Booking Page</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Print the QR code and display it in your business</li>
              <li>• Add it to your business cards or flyers</li>
              <li>• Share the URL on social media</li>
              <li>• Include it in email signatures</li>
              <li>• Customers scan and book instantly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}