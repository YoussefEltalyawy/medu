import React from "react";
import Image from "next/image";
import { BookOpen, Sparkles, Users, GraduationCap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  variant: "login" | "signup";
  title: string;
  subtitle: string;
  features?: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
}

export default function AuthLayout({
  children,
  variant,
  title,
  subtitle,
  features
}: AuthLayoutProps) {
  const defaultFeatures = variant === "login"
    ? [
      { icon: <BookOpen className="w-6 h-6" />, text: "Discover • Learn • Grow" }
    ]
    : [
      { icon: <Sparkles className="w-5 h-5" />, text: "Personalized Learning" },
      { icon: <Users className="w-5 h-5" />, text: "Community Driven" },
      { icon: <GraduationCap className="w-5 h-5" />, text: "Expert Content" }
    ];

  const displayFeatures = features || defaultFeatures;
  const gradientColors = variant === "login"
    ? "from-[#11434E] via-[#082408] to-[#11434E]"
    : "from-[#082408] via-[#11434E] to-[#082408]";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Brand Section */}
      <div className={`flex-1 bg-gradient-to-br ${gradientColors} flex flex-col justify-center items-center p-8 lg:p-12 text-white relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-0 ${variant === "login" ? "left-0" : "right-0"} w-96 h-96 bg-[#DAF0DA] rounded-full ${variant === "login" ? "-translate-x-1/2 -translate-y-1/2" : "translate-x-1/2 -translate-y-1/2"} animate-float`}></div>
          <div className={`absolute bottom-0 ${variant === "login" ? "right-0" : "left-0"} w-64 h-64 bg-[#EDE7D1] rounded-full ${variant === "login" ? "translate-x-1/2 translate-y-1/2" : "-translate-x-1/2 translate-y-1/2"} animate-float-delay-1`}></div>

          {/* Additional floating elements */}
          <div className={`absolute top-1/4 ${variant === "login" ? "right-1/4" : "left-1/4"} w-32 h-32 bg-[#DAF0DA] rounded-full opacity-20 animate-float-delay-2`}></div>
          <div className={`absolute bottom-1/4 ${variant === "login" ? "left-1/4" : "right-1/4"} w-24 h-24 bg-[#EDE7D1] rounded-full opacity-20 animate-float`}></div>
        </div>

        {/* Logo and Brand Content */}
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300 animate-scale-in">
            <Image
              src="/medu-logo.svg"
              alt="Medu Logo"
              width={200}
              height={98}
              className="mx-auto filter brightness-0 invert drop-shadow-lg"
            />
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#DAF0DA] bg-clip-text text-transparent animate-fade-in">
            {title}
          </h1>

          <p className="text-lg text-[#DAF0DA] mb-8 leading-relaxed animate-fade-in delay-200">
            {subtitle}
          </p>

          <div className={`space-y-${variant === "login" ? "0" : "4"} animate-fade-in delay-500`}>
            {displayFeatures.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center justify-center ${variant === "login" ? "space-x-4" : "space-x-3"} text-[#EDE7D1] transform hover:scale-105 transition-all duration-300`}
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className="transform hover:rotate-12 transition-transform duration-300">
                  {feature.icon}
                </div>
                <span className={`font-medium ${variant === "login" ? "text-sm" : "text-sm"}`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white relative">
        {/* Subtle background pattern for form side */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#11434E] rounded-full animate-float-delay-1"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[#082408] rounded-full animate-float-delay-2"></div>
        </div>

        <div className="relative z-10 w-full max-w-md animate-slide-in-right">
          {children}
        </div>
      </div>
    </div>
  );
}
