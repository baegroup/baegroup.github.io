export const HOME_MEDIA = {
  heroCover: 'assets/img/home/hero/cover.jpg',
  researchAreas: [
    'assets/img/home/research/area-1.jpg',
    'assets/img/home/research/area-2.jpg',
    'assets/img/home/research/area-3.jpg'
  ],
  newsFeatured: 'assets/img/home/news/featured.jpg',
  joinTeam: 'assets/img/home/join/team.jpg'
};

export function resolveHomeMedia(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

export function mediaCandidates(path) {
  const dotIndex = path.lastIndexOf('.');
  if (dotIndex < 0) {
    return [resolveHomeMedia(path)];
  }

  const basePath = path.slice(0, dotIndex);
  return SUPPORTED_IMAGE_EXTENSIONS.map((ext) => resolveHomeMedia(`${basePath}.${ext}`));
}
