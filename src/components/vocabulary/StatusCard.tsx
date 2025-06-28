import { Squircle } from "corner-smoothing";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  count: number | string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  suffix?: string;
}

export const StatusCard = ({ 
  title, 
  count, 
  icon: Icon, 
  bgColor, 
  textColor, 
  suffix
}: StatusCardProps) => (
  <Squircle
    cornerRadius={20}
    className={`${bgColor} ${textColor} p-6 relative overflow-hidden before:${bgColor} h-full`}
  >
    <div className="relative z-10 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <Icon className={`w-5 h-5 ${textColor}`} />
      </div>
      <div className="mt-auto text-right">
        <div className="text-3xl font-bold">{count}{suffix ? ` ${suffix}` : ""}</div>
      </div>
    </div>
  </Squircle>
);