import React from "react";

/** Small page title band reusing the landing page banner styling. */
export default function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-white dark:bg-dark border-b border-ld">
      <div className="container py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-dark dark:text-white">{title}</h1>
        {subtitle ? <p className="text-darklink mt-3 max-w-2xl mx-auto">{subtitle}</p> : null}
      </div>
    </div>
  );
}
