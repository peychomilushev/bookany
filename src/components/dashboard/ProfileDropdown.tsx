// src/components/dashboard/ProfileDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { CreditCard, LogOut, User } from "lucide-react";

interface ProfileDropdownProps {
  onTabChange: (tab: string) => void;
}

export function ProfileDropdown({ onTabChange }: ProfileDropdownProps) {
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.email?.[0]?.toUpperCase() || "A";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-fade-in">
          <button
            onClick={() => {
              onTabChange("subscription");
              setOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
            Абонамент
          </button>

          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Изход
          </button>
        </div>
      )}
    </div>
  );
}
