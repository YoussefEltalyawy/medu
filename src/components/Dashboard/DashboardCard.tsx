"use client";
import React from "react";
import { Squircle } from "corner-smoothing";

interface DashboardCardProps {
  title: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  className = "",
  children,
}) => {
  return (
    <Squircle
      borderWidth={2}
      cornerRadius={25}
      className={`bg-brand-light-green text-brand-light-green px-5 py-5 flex flex-col gap-2 min-w-[180px] before:bg-brand-green ${className}`}
    >
      <div className="flex items-center gap-2 text-light-green text-lg font-medium">
        {icon && <span className="text-lg">{icon}</span>}
        <span>{title}</span>
      </div>
      {value && (
        <div className="text-3xl font-semibold text-brand-light-green mt-18 self-end">{value}</div>
      )}
      {children}
    </Squircle>
  );
};

export default DashboardCard;
