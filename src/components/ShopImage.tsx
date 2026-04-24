'use client';

interface ShopImageProps {
  photoProxy?: string;
  photo?: string;
  name: string;
  height?: string;
  fallbackText?: string;
}

export default function ShopImage({ photoProxy, photo, name, height = 'h-40', fallbackText = 'No Image' }: ShopImageProps) {
  if (!photoProxy && !photo) {
    return (
      <div className={`w-full ${height} bg-dungeon-canvas flex items-center justify-center text-dungeon-secondary`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={photoProxy || photo}
      alt={name}
      data-fallback="0"
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        const step = parseInt(img.getAttribute('data-fallback') || '0');
        if (step === 0 && photo && img.src !== photo) {
          img.setAttribute('data-fallback', '1');
          img.src = photo;
        } else if (step < 2) {
          img.setAttribute('data-fallback', '2');
          img.style.display = 'none';
          const parent = img.parentElement;
          if (parent && !parent.querySelector('span.fallback-img')) {
            const span = document.createElement('span');
            span.className = `flex items-center justify-center ${height} w-full text-dungeon-secondary fallback-img`;
            span.textContent = fallbackText;
            parent.appendChild(span);
          }
        }
      }}
      className={`w-full ${height} object-cover`}
    />
  );
}
