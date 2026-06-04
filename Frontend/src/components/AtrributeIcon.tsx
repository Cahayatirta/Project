import { FaRegSmile } from "react-icons/fa";
import { FaArrowTrendUp, FaRegClock } from "react-icons/fa6";
import { GoPulse } from "react-icons/go";
// import { GoPulse } from "react-icons/go";
import { IoMoonOutline } from "react-icons/io5";
import { LuMonitor } from "react-icons/lu";
import { VscCoffee } from "react-icons/vsc";
import type { StatLabel } from "../utils/types";

const icons = {
  'Screen Time': LuMonitor,
  'Sleep Duration': IoMoonOutline,
  'Caffeine Intake': VscCoffee,
  'Mood': FaRegSmile,
  'Physical Activity': FaArrowTrendUp,
  'Work Hours': FaRegClock,
  'Avg Sleep Duration': IoMoonOutline,
  'Avg Screen Time': LuMonitor,
  'Avg Exercise': FaArrowTrendUp,
  'Stress Level': GoPulse,
}

interface IconDisplayProps extends React.ComponentProps<'svg'> {
  attr: StatLabel;
}

export default function AttributeIcon({ attr, ...props }: IconDisplayProps) {
  const Icon = icons[attr];
  return <Icon {...props} />;
}
