interface RouteMeta {
  title: string;
  description: string;
  image?: string;
}

const DEFAULT_DESCRIPTION = 'Portfolio of Brandon Lien — post-production sound, film, and music.';

const ROUTES: Record<string, RouteMeta> = {
  '/': {
    title: 'Brandon Lien Portfolio',
    description: DEFAULT_DESCRIPTION,
  },
  '/post-sound': {
    title: 'Brandon Lien - Post Sound',
    description: 'Post-production sound credits and reel for Brandon Lien.',
  },
  '/films': {
    title: 'Brandon Lien - Post Sound',
    description: 'Post-production sound credits and reel for Brandon Lien.',
  },
  '/film': {
    title: 'Brandon Lien - Film',
    description: 'Film and video work by Brandon Lien.',
  },
  '/music': {
    title: 'Brandon Lien - Music',
    description: 'Music releases and collaborations by Brandon Lien.',
  },
  '/about': {
    title: 'Brandon Lien - About',
    description: DEFAULT_DESCRIPTION,
  },
};

class MetaRewriter {
  constructor(
    private meta: RouteMeta,
    private origin: string,
    private pathname: string
  ) {}

  element(element: Element) {
    const tag = element.tagName;

    if (tag === 'title') {
      element.setInnerContent(this.meta.title);
      return;
    }

    const property = element.getAttribute('property') || element.getAttribute('name');
    const imageUrl = `${this.origin}${this.meta.image ?? '/assets/about-web/preview-square.jpg'}`;

    switch (property) {
      case 'description':
      case 'og:description':
      case 'twitter:description':
        element.setAttribute('content', this.meta.description);
        break;
      case 'og:title':
      case 'twitter:title':
        element.setAttribute('content', this.meta.title);
        break;
      case 'og:image':
      case 'twitter:image':
        element.setAttribute('content', imageUrl);
        break;
      case 'og:url':
        element.setAttribute('content', `${this.origin}${this.pathname}`);
        break;
    }
  }
}

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  const url = new URL(context.request.url);
  const meta = ROUTES[url.pathname];

  if (!meta) {
    return response;
  }

  const rewriter = new MetaRewriter(meta, url.origin, url.pathname);

  return new HTMLRewriter()
    .on('title', rewriter)
    .on('meta', rewriter)
    .transform(response);
};
