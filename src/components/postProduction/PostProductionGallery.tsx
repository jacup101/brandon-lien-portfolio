import { useEffect, useMemo, useState } from 'react';
import { fetchPublicEntries, publicAssetUrl } from '../../lib/backendApi';
import type { PostProductionWork } from '../../types/PostProductionWork';
import './PostProductionGallery.css';

interface PostProductionGalleryProps {
  featuredOnly?: boolean;
}

function PostProductionGallery(props: PostProductionGalleryProps) {
  const [allItems, setAllItems] = useState<PostProductionWork[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPublicEntries('post-sound')
      .then((entries) => {
        if (cancelled) return;
        const items = entries.map((entry) => ({
          ...(entry.data as Omit<PostProductionWork, 'updatedAt'>),
          updatedAt: entry.updatedAt,
        }));
        setAllItems(items);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setAllItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const workItems = useMemo<PostProductionWork[]>(
    () => (allItems ? (props.featuredOnly ? allItems.filter((item) => item.featured) : allItems) : []),
    [allItems, props.featuredOnly]
  );

  if (allItems === null) {
    return (
      <div className="pp-gallery-loading" aria-label="Loading gallery" aria-busy="true">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="pp-gallery-loading-card" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return <p style={{ color: 'var(--site-muted)', textAlign: 'center' }}>Couldn&apos;t load the gallery right now.</p>;
  }

  return (
    <div className="pp-gallery pp-gallery-loaded">
      {workItems.map((item, index) => {
        const hasLink = item.link.trim() !== '' && item.link !== '#';
        const imgSrc = publicAssetUrl(item.imgPath) + (item.updatedAt ? `?v=${item.updatedAt}` : '');
        const cardContent = (
          <div className="pp-gallery-image-wrap">
            <img
              src={imgSrc}
              alt={item.title}
              className="pp-gallery-image"
              loading={index < 8 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index < 4 ? 'high' : 'auto'}
            />
            <div className="pp-gallery-overlay">
              <p className="pp-gallery-title">{item.title}</p>
              <p className="pp-gallery-role">{item.role}</p>
              <p className="pp-gallery-type">{item.type}</p>
            </div>
          </div>
        );

        return (
          <article key={item.title} className="pp-gallery-card">
            {hasLink ? (
              <a
                className="pp-gallery-link"
                href={item.link}
                target="_blank"
                rel="noreferrer"
              >
                {cardContent}
              </a>
            ) : (
              <div className="pp-gallery-link">{cardContent}</div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default PostProductionGallery;
