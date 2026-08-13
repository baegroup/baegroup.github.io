import { Link } from 'react-router-dom';

import { PageHero } from '@/components/site/PageHero';

const RESEARCH_AREAS = [
  {
    title: '첨단 적층제조',
    body: '에어로젤, 액체금속, 기능성 하이드로젤을 위한 직접잉크쓰기와 임베디드 3D 프린팅 공정을 연구합니다.'
  },
  {
    title: '에너지·환경 소재',
    body: '차세대 에너지 하베스팅, 리튬금속전지, 화학·온도 센서 및 탄소포집을 위한 기능성 소재를 개발합니다.'
  },
  {
    title: '바이오 기능성 소자',
    body: '연성 기능성 소재와 정밀 제조기술을 결합해 바이오센서, 바이오전자소자 및 생체의료 응용을 탐구합니다.'
  }
];

const SELECTED_PUBLICATIONS = [
  {
    year: 2025,
    topic: '비고전적 핵생성과 결정화',
    title: 'Discovery of a Liquid Crystal Phase of Sodium Halides via a Nonclassical Nucleation Pathway',
    journal: 'Advanced Powder Materials',
    link: 'https://doi.org/10.1016/j.apmate.2025.100336'
  },
  {
    year: 2025,
    topic: '리튬금속 음극 표면공학',
    title: 'Emerging Surface Engineering Methods for Lithium Metal Anodes: Critical Review Beyond Conventional SEI and Surface Coatings',
    journal: 'Advanced Materials',
    link: 'https://doi.org/10.1002/adma.202501959'
  },
  {
    year: 2025,
    topic: '의약품 핵생성과 비정질화',
    title: 'Two-Step Nucleation and Amorphization of Carbamazepine Using a Micro-Droplet Precipitation System',
    journal: 'Pharmaceutics',
    link: 'https://doi.org/10.3390/pharmaceutics17081035'
  },
  {
    year: 2024,
    topic: '고성능 호흡용 나노필터',
    title: 'Advancing Breathability of Respiratory Nanofilter by Optimizing Pore Structure and Alignment in Nanofiber Networks',
    journal: 'ACS Nano',
    link: 'https://doi.org/10.1021/acsnano.3c06060'
  },
  {
    year: 2023,
    topic: '하이드로볼타익 에너지 하베스팅',
    title: 'Hydrovoltaic Electricity Generator with Hygroscopic Materials: A Review and New Perspective',
    journal: 'Advanced Materials',
    link: 'https://doi.org/10.1002/adma.202301080'
  }
];

export function KoreanLandingPage() {
  return (
    <article className="space-y-9 md:space-y-12" lang="ko">
      <PageHero
        description="경희대학교 화학공학과 배재형 교수 연구실의 연구와 구성원, 대학원생 모집 정보를 소개합니다."
        showDescription
        title="배재형 교수 연구실 · Bae Lab"
      />

      <section className="border-t border-slate-200 pt-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
          <h2 className="page-section-title">연구실 소개</h2>
          <div className="space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              Bae Lab은 기능성 소재와 첨단 적층제조의 접점에서 에너지, 환경 및 바이오 분야의 문제를 해결하는 다학제 연구를 수행합니다.
              화학공학, 재료과학, 고분자, 기계 및 바이오공학의 원리를 연결해 실제 응용으로 이어질 수 있는 소재와 제조기술을 개발합니다.
            </p>
            <p>
              연구실은 경희대학교 국제캠퍼스 화학공학과에 있으며, 배재형 교수가 연구책임자를 맡고 있습니다.
            </p>
            <div className="site-action-links pt-1">
              <Link className="site-action-link" to="/team/jaehyeong-bae/">배재형 교수 소개</Link>
              <Link className="site-action-link" to="/team/members/">연구실 구성원</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-7">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-10">
          <h2 className="page-section-title">배재형 교수의 연구</h2>
          <div className="space-y-4 text-base leading-relaxed text-slate-700">
            <p>
              경희대학교 화학공학과 배재형 교수는 기능성 소재와 적층제조의 접점에서 에너지·환경 문제를 해결하는 다학제 연구를 수행합니다.
              광산(photoacid) 기반 액상 태양전지, 솔보젤 패시베이션 리튬금속 음극, 신축성 하이드로젤 슈퍼커패시터, 화학·온도 센서,
              비고전적 핵생성과 결정화 및 직접잉크쓰기 공정을 연구해 왔습니다.
            </p>
            <p>
              현재는 열관리를 위한 에어로젤·액체금속 직접잉크쓰기, 탄소포집용 기능성 하이드로젤,
              생체의료 응용을 위한 임베디드 3D 프린팅을 중심으로 첨단 적층제조와 기능성 소재 연구를 확장하고 있습니다.
            </p>
            <div className="site-action-links pt-1">
              <Link className="site-action-link" to="/team/jaehyeong-bae/">교수 상세 소개</Link>
              <Link className="site-action-link" to="/research/">전체 연구 분야</Link>
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
            <div>
              <h2 className="page-section-title">최근 주요 논문</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">기능성 소재, 에너지·환경 및 결정화 연구의 최근 성과입니다.</p>
            </div>
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
                  <p className="text-sm font-medium text-[var(--brand-burgundy)]">{publication.topic}</p>
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
              현재 석사과정, 박사과정, 석박통합과정 및 학부연구생을 모집하고 있습니다. 박사후연구원은 펠로십 지원이 가능한 경우 협의할 수 있습니다.
              지원 관련 문의와 제출 자료는 모집 안내 페이지에서 확인해 주세요.
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
