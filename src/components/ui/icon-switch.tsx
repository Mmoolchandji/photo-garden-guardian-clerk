import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

// A custom switch component that displays icons inside the switch itself.
const IconSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    iconOn: React.ReactNode;
    iconOff: React.ReactNode;
  }
>(({ className, iconOn, iconOff, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-8 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-600",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none absolute flex h-7 w-10 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-9 data-[state=unchecked]:translate-x-0.5"
      )}
    >
      {props.checked ? iconOn : iconOff}
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
IconSwitch.displayName = "IconSwitch";

export { IconSwitch };
