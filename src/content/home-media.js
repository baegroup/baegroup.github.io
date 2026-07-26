export const HOME_MEDIA = {
  heroCover: 'assets/img/home/hero/cover-1920.jpg',
  heroCoverWebp: [
    { path: 'assets/img/home/hero/cover-768.webp', width: 768 },
    { path: 'assets/img/home/hero/cover-1280.webp', width: 1280 },
    { path: 'assets/img/home/hero/cover-1920.webp', width: 1920 }
  ],
  researchAreas: [
    'assets/img/home/research/area-1.jpg',
    'assets/img/home/research/area-2.png',
    'assets/img/home/research/area-3.png'
  ],
  newsFeatured: 'assets/img/home/news/featured.jpg',
  joinTeam: 'assets/img/home/join/team.jpg'
};

export function resolveHomeMedia(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

export function buildImageSrcSet(sources) {
  return sources.map(({ path, width }) => `${resolveHomeMedia(path)} ${width}w`).join(', ');
}

const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export function mediaCandidates(path) {
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex < 0) {
    return [resolveHomeMedia(path)];
  }

  const basePath = path.slice(0, dotIndex);
  const requestedExtension = path.slice(dotIndex + 1).toLowerCase();
  if (!SUPPORTED_IMAGE_EXTENSIONS.includes(requestedExtension)) {
    return [resolveHomeMedia(path)];
  }

  const extensions = [
    requestedExtension,
    ...SUPPORTED_IMAGE_EXTENSIONS.filter((ext) => ext !== requestedExtension)
  ];
  return extensions.map((ext) => resolveHomeMedia(`${basePath}.${ext}`));
}
