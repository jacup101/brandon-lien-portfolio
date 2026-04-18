import './SocialLinks.css';

interface SocialLink {
  href: string;
  ariaLabel: string;
  iconClass: string;
}

interface SocialLinksProps {
  links: SocialLink[];
}

function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="social-link-row" aria-label="External links">
      {links.map((link) => (
        <a
          key={link.href}
          className={`social-link-icon ${link.iconClass}`}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.ariaLabel}
        />
      ))}
    </div>
  );
}

export default SocialLinks;
export type { SocialLink };
