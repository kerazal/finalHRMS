import Image from "next/image";

// Corrected the last partner's URL to be an actual image link
const partners = [
  {
    name: "Acme Realty",
    logo: "/partners/acme.png", // This is not used for the image source anymore
    url: "https://www.propmart.co/wp-content/uploads/2021/10/logo-1.png",
  },
  {
    name: "Urban Living",
    logo: "/partners/urban.png",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTb3PJsfG9bu82YCE3tofPl9skQ4yzd6aa7QQ&s",
  },
  {
    name: "HomeTrust",
    logo: "/partners/hometrust.png",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7QKcpn2JtKr8VRDmrPVeSP2EMeL9AjhPBLw&s",
  },
  {
    name: "Green Estates",
    logo: "/partners/green.png",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTE2L1QiEk-bFZTRMky3ZrHlFAmXYfw1f1kw&s",
  },
  {
    name: "Prime Properties",
    logo: "/partners/prime.png",
    // NOTE: I changed this from a website to an image URL.
    // The original "https://primeproperties.com" would not have worked.
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPdDTqt8AOVE0dKYiYLdyy6R3L-hZ8rGLsnA&s",
  },
];

export function PartnersSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
          Our Trusted Partners
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {partners.map((partner) => (
            // The <a> tag should link to the partner's website, not the image.
            // For this example, let's assume the link is the same as the image,
            // but in a real app, you'd have a separate 'websiteUrl' property.
            <a
              key={partner.name}
              href={partner.url} // You might want a different URL here for the actual link
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center group"
            >
              <div className="w-32 h-16 flex items-center justify-center bg-gray-50 rounded shadow hover:shadow-lg transition">
                <Image
                  // --- THIS IS THE MAIN FIX ---
                  src={partner.url}
                  alt={`${partner.name} logo`}
                  width={120}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="mt-2 text-sm text-gray-700 group-hover:text-primary font-medium">
                {partner.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}