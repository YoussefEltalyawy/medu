"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Discover", href: "/discover" },
    { name: "Learn", href: "/learn" },
  ];

  return (
    <nav className="w-full p-4 border-b">
      <div className="relative flex items-center justify-between w-full mx-auto">
        {/* Logo - Left */}
        <div className="flex-shrink-0 dark:hidden">
          <Link href="/">
            <Image
              src={`/blue-logo.svg`}
              alt={"Medu Logo"}
              width={56}
              height={48}
            />
          </Link>
        </div>
        <div className="flex-shrink-0 hidden dark:block">
          <Link href="/">
            <Image
              src={`/white-logo.png`}
              alt={"Medu Logo"}
              width={56}
              height={48}
              className="opacity-60"
            />
          </Link>
        </div>

        {/* Nav Items - Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base px-3 py-2 font-medium ${
                  pathname === item.href
                    ? "border-b-4 border-accent"
                    : "hover:opacity-70"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Button - Right */}
        <div className="flex-shrink-0">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
