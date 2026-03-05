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
