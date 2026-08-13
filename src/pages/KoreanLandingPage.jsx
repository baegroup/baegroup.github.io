import { Link } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';

const RESEARCH_AREAS = [
  {
    title: '첨단 적층제조·3D 프린팅',
    body: '에어로젤, 액체금속, 하이드로젤처럼 공정 조건에 민감한 소재를 안정적으로 프린팅할 수 있는 조성과 공정을 개발하고 있습니다. 이를 바탕으로 직접잉크쓰기와 임베디드 3D 프린팅에 적용할 수 있는 소재와 구조를 넓혀가고자 합니다.'
  },
  {
    title: '에너지·환경 소재',
    body: '리튬금속전지, 에너지 하베스팅, 탄소포집과 센서에 활용할 기능성 소재를 설계하고, 각 응용에서 필요한 성능을 구현하는 방법을 연구하고 있습니다.'
  },
  {
    title: '바이오 응용',
    body: '연성 기능성 소재와 3D 프린팅을 결합해 사용 목적과 환경에 맞는 바이오센서, 바이오전자소자 및 생체의료 소자를 만들고자 합니다.'
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
  },
  {
    year: 2024,
    title: 'Advancing Breathability of Respiratory Nanofilter by Optimizing Pore Structure and Alignment in Nanofiber Networks',
    journal: 'ACS Nano',
    link: 'https://doi.org/10.1021/acsnano.3c06060'
  },
  {
    year: 2023,
    title: 'Hydrovoltaic Electricity Generator with Hygroscopic Materials: A Review and New Perspective',
    journal: 'Advanced Materials',
    link: 'https://doi.org/10.1002/adma.202301080'
  }
];

export function KoreanLandingPage() {
  return (
    <article className="space-y-9 md:space-y-12" lang="ko">
      <PageHero
        description="경희대학교 화학공학과 Bae Lab의 연구 분야와 구성원, 학생 모집 정보를 소개합니다."
        showDescription
        title="배재형 교수 연구실 · Bae Lab"
      />

      <section className="border-t border-slate-200 pt-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
          <h2 className="page-section-title">연구실 소개</h2>
          <div className="space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              경희대학교 국제캠퍼스 화학공학과에 있는 Bae Lab에서는 기능성 소재의 설계와 적층제조 공정을 연구하고 있습니다.
              소재 합성과 조성 설계뿐 아니라 잉크 제조, 3D 프린팅(3D printing) 공정, 소자 제작과 특성 평가까지 폭넓게 다루며,
              소재의 특성을 실제 구조와 소자에서 효과적으로 구현하는 방법을 찾고자 합니다.
            </p>
            <p>
              현재는 에어로젤과 액체금속의 직접잉크쓰기, 탄소포집용 하이드로젤, 리튬금속전지 소재,
              화학·온도 센서 및 생체의료용 임베디드 3D 프린팅을 중심으로 연구하고 있습니다.
            </p>
            <div className="site-action-links pt-1">
              <Link className="site-action-link" to="/team/jaehyeong-bae/">배재형 교수 소개</Link>
              <Link className="site-action-link" to="/team/members/">연구실 구성원</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="page-section-title">주요 연구 분야</h2>
            <Link className="site-action-link" to="/research/">연구 상세 보기</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {RESEARCH_AREAS.map((area) => (
              <section className="border-t border-slate-300 pt-4" key={area.title}>
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">{area.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">{area.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="page-section-title">최근 주요 논문</h2>
            <Link className="site-action-link" to="/publications/">전체 논문 보기</Link>
          </div>
          <ol className="border-t border-slate-900">
            {SELECTED_PUBLICATIONS.map((publication, index) => (
              <li
                className="grid grid-cols-[2.125rem_minmax(0,1fr)] gap-3 border-b border-slate-200 py-5"
                key={publication.title}
              >
                <span className="pt-1 text-xs font-semibold tracking-[0.04em] text-[var(--brand-burgundy)] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold leading-snug text-slate-950 md:text-xl">{publication.title}</h3>
                  <p className="text-sm text-slate-600">
                    <span className="italic text-slate-700">{publication.journal}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    {publication.year}
                    <span className="mx-2 text-slate-400">·</span>
                    <a className="site-text-link not-italic" href={publication.link} rel="noreferrer" target="_blank">DOI</a>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
          <h2 className="page-section-title">대학원생 및 학부연구생 모집</h2>
          <div className="space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              Bae Lab에서는 현재 석사과정, 박사과정, 석박통합과정 및 학부연구생으로 함께 연구할 학생을 찾고 있습니다.
              박사후연구원은 펠로십 지원을 준비하는 경우 협의할 수 있으며, 관심 있는 분은 모집 안내 페이지에서 연구 분야와 제출 자료를 확인해 주세요.
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
