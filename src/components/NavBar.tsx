"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ModeToggle } from "./ModeToggle";

const NavBar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Discover", href: "/discover" },
    { name: "Learn", href: "/learn" },
    { name: "Profile", href: "/profile" },
  ];

  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <Image
            src={`/medu-logo.svg`}
            alt={"Medu Logo"}
            width={48}
            height={32}
            className="opacity-50"
          />
        </Link>
        <div className="flex space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-base px-3 py-2 font-medium ${pathname === item.href
                ? "border-b-4 border-brand-accent"
                : "hover:text-black/70"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
