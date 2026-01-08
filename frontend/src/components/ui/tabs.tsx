"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "tabs-trigger",
        "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap",
        "rounded-t-md cursor-pointer",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        className,
      )}
      style={{
        borderBottom: '2px solid transparent',
        color: '#4b5563',
        background: 'transparent',
        transition: 'all 0.2s ease-in-out',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        if (target.getAttribute('data-state') !== 'active') {
          target.style.color = '#2563eb';
          target.style.background = 'rgba(219, 234, 254, 0.7)';
          target.style.borderBottomColor = '#60a5fa';
        }
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        if (target.getAttribute('data-state') !== 'active') {
          target.style.color = '#4b5563';
          target.style.background = 'transparent';
          target.style.borderBottomColor = 'transparent';
        }
      }}
      ref={(el) => {
        if (el) {
          const updateStyles = () => {
            if (el.getAttribute('data-state') === 'active') {
              el.style.color = '#2563eb';
              el.style.background = 'rgba(219, 234, 254, 0.7)';
              el.style.borderBottomColor = '#2563eb';
              el.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.4)';
            } else {
              el.style.color = '#4b5563';
              el.style.background = 'transparent';
              el.style.borderBottomColor = 'transparent';
              el.style.boxShadow = 'none';
            }
          };
          updateStyles();
          // Observe state changes
          const observer = new MutationObserver(updateStyles);
          observer.observe(el, { attributes: true, attributeFilter: ['data-state'] });
        }
      }}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
