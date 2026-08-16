import { Link } from 'react-router-dom';

import { ExternalLinkIcon } from '@/components/site/ExternalLinkIcon';
import { PageHero } from '@/components/site/PageHero';

const RESEARCH_AREAS = [
  {
    title: '첨단 적층제조·3D 프린팅',
    body: '에어로젤, 액체금속, 하이드로젤에 적합한 소재 조성과 공정을 개발하고, 직접잉크쓰기와 임베디드 3D 프린팅을 통해 정밀한 구조로 구현하는 방법을 연구합니다.'
  },
  {
    title: '에너지·환경 소재',
    body: '기능성 소재의 분자·계면 설계부터 소자 구조까지 함께 고려해 리튬금속전지, 에너지 하베스팅, 탄소포집 및 환경 센서의 성능을 높이는 방법을 연구합니다.'
  },
  {
    title: '바이오 응용',
    body: '연성 기능성 소재와 3D 프린팅을 결합해 실시간 바이오센서, 최소침습형 바이오전자소자, 원격제어 연성 로봇 등 개인 맞춤형 생체의료 소자를 개발합니다.'
  }
];

const SELECTED_PUBLICATIONS = [
  {
    year: 2025,
    title: 'Discovery of a Liquid Crystal Phase of Sodium Halides via a Nonclassical Nucleation Pathway',
    journal: 'Advanced Powder Materials',
    link: 'https://doi.org/10.1016/j.apmate.2025.100336'
  },
  {
    year: 2025,
    title: 'Emerging Surface Engineering Methods for Lithium Metal Anodes: Critical Review Beyond Conventional SEI and Surface Coatings',
    journal: 'Advanced Materials',
    link: 'https://doi.org/10.1002/adma.202501959'
  },
  {
    year: 2025,
    title: 'Two-Step Nucleation and Amorphization of Carbamazepine Using a Micro-Droplet Precipitation System',
    journal: 'Pharmaceutics',
    link: 'https://doi.org/10.3390/pharmaceutics17081035'
  }
];

export function KoreanLandingPage() {
  return (
    <article className="space-y-9 md:space-y-12" lang="ko">
      <PageHero
        description="기능성 소재와 적층제조를 기반으로 한 에너지·환경·바이오 연구"
        showDescription
        title="배재형 교수 연구실 · Bae Lab"
      />

      <section className="site-rule-strong border-t pt-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-10">
          <h2 className="page-section-title">연구실 소개</h2>
          <div className="site-copy-body site-reading-measure space-y-4">
            <p>
              경희대학교 국제캠퍼스 화학공학과 Bae Lab에서는 기능성 소재를 설계하고, 이를 적층제조 공정으로 실제 구조와 소자에 구현하는 방법을 연구합니다.
              소재 합성 및 조성 설계, 잉크 제조, 3D 프린팅(3D printing), 소자 제작과 특성 평가를 폭넓게 수행하고 있습니다.
            </p>
            <p>
              주요 연구 주제는 에어로젤 및 액체금속의 직접잉크쓰기, 탄소포집용 하이드로젤, 리튬금속전지 소재,
              화학·온도 센서, 생체의료용 임베디드 3D 프린팅입니다.
            </p>
            <div className="site-action-links pt-1">
              <Link className="site-action-link" to="/team/jaehyeong-bae/">배재형 교수 소개</Link>
              <Link className="site-action-link" to="/team/members/">연구실 구성원</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="site-rule-strong border-t pt-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="page-section-title">주요 연구 분야</h2>
            <Link className="site-action-link" to="/research/">연구 상세 보기</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {RESEARCH_AREAS.map((area) => (
              <section className="site-rule-soft border-t pt-4" key={area.title}>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">{area.title}</h3>
                <p className="site-copy-body mt-2">{area.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="site-rule-strong border-t pt-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="page-section-title">최근 주요 논문</h2>
            <Link className="site-action-link" to="/publications/">전체 논문 보기</Link>
          </div>
          <ol className="site-rule-strong border-t">
            {SELECTED_PUBLICATIONS.map((publication, index) => (
              <li
                className="site-list-row site-rule-soft grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b"
                key={publication.title}
              >
                <span className="site-meta-index pt-1">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold leading-snug text-slate-950 md:text-xl">{publication.title}</h3>
                  <p className="text-sm text-slate-600">
                    <span className="italic text-slate-700">{publication.journal}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    {publication.year}
                    <span className="mx-2 text-slate-400">·</span>
                    <a className="site-text-link not-italic" href={publication.link} rel="noreferrer" target="_blank">DOI<ExternalLinkIcon /></a>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="site-rule-strong border-t pt-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-10">
          <h2 className="page-section-title">학생 모집</h2>
          <div className="site-copy-body site-reading-measure space-y-4">
            <p>
              현재 석사과정, 박사과정, 석박통합과정 및 학부연구생을 모집하고 있습니다.
              자기주도적으로 연구하고 새로운 아이디어에 도전할 학생을 찾고 있습니다.
              박사후연구원은 외부 또는 기관 펠로십 지원을 준비하는 경우에 한해 협의할 수 있습니다.
            </p>
            <div className="site-action-links">
              <Link className="site-action-link" to="/join/">모집 안내 보기</Link>
              <Link className="site-action-link" to="/contact/">연락처 및 위치</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
