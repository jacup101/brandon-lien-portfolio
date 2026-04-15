import { useMemo } from 'react';
import { POST_PRODUCTION_WORK } from '../../data/postProductionWork';
import type { PostProductionWork } from '../../types/PostProductionWork';
import './PostProductionGallery.css';

interface PostProductionGalleryProps {
  featuredOnly?: boolean;
}

function PostProductionGallery(props: PostProductionGalleryProps) {
  const workItems = useMemo<PostProductionWork[]>(
    () =>
      props.featuredOnly
        ? POST_PRODUCTION_WORK.filter((item) => item.featured)
        : POST_PRODUCTION_WORK,
    [props.featuredOnly]
  );

  return (
    <div className="pp-gallery pp-gallery-loaded">
      {workItems.map((item, index) => {
        const hasLink = item.link.trim() !== '' && item.link !== '#';
        const cardContent = (
          <div className="pp-gallery-image-wrap">
            <img
              src={encodeURI(item.imgPath)}
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
