import Image from "next/image";

// Data remains the same
const partners = [
  {
    name: "PropMart",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFeMdo9gEjbRC-zVHCygQWhN_EMpsT17WO9g&s",
    websiteUrl: "#", 
  },
  {
    name: "Urban Living",
    logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm3NtbcCS5CWqTkMZMVPhHRQnHddl5nVPoxA&s",
    websiteUrl: "#",
  },
  {
    name: "HomeTrust",
    logoUrl: "data:image/png;base64,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",
    websiteUrl: "#",
  },
  {
    name: "Green Estates",
    logoUrl: "data:image/png;base64,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",
    websiteUrl: "#",
  },
  {
    name: "Prime Properties",
    logoUrl: "https://primeproperties.com.ph/wp-content/uploads/2020/07/Prime-Properties-Logo-1.png",
    websiteUrl: "#",
  },
  {
    name: "Skyline Realty",
    logoUrl: "https://skyline-realty.com/wp-content/uploads/2022/01/skyline-realty-logo-header.png",
    websiteUrl: "#",
  },
  {
    name: "Apex Homes",
    logoUrl: "https://apexhomes.com/wp-content/uploads/2021/05/apex-homes-logo.png",
    websiteUrl: "#",
  },
];

export function PartnersSection() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900 py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
          Trusted by the Industry's Best
        </h2>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
          We collaborate with a network of trusted partners to bring you the highest quality listings and services.
        </p>
        
        <div
          className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
        >
          <div className="flex w-max animate-scroll">
            {[...partners, ...partners].map((partner, index) => (
              <a
                key={`${partner.name}-${index}`}
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                // --- CHANGE: Added a subtle background and padding for dark mode ---
                className="
                  flex items-center justify-center w-[250px] h-28 mx-4 p-4
                  transition-colors duration-300
                  dark:bg-slate-800/50 dark:hover:bg-slate-800 dark:rounded-lg
                " 
                aria-label={`Visit ${partner.name}`}
              >
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  width={180}
                  height={80}
                  className="
                    object-contain h-full w-full
                    /* --- CHANGE: Removed dark:invert --- */
                  "
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
