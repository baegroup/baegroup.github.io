import { useState } from 'react';

import { HOME_MEDIA, mediaCandidates } from '@/content/home-media';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const HOME_RESEARCH_BODY_OVERRIDES = {
  en: [
    'We advance precision additive manufacturing by combining rheology-informed ink design, custom printhead engineering, and AI-assisted process control for reproducible high-fidelity structures.',
    'We design molecular-to-device functional material platforms for energy harvesting, carbon management, and electrochemical systems, translating laboratory performance into deployable engineering outcomes.',
    'We engineer soft and biocompatible functional materials for real-time biosensing, minimally invasive bioelectronics, and adaptive medical interfaces with practical reliability.'
  ],
  ko: [
    '유변학 기반 잉크 설계, 맞춤형 프린트헤드 엔지니어링, AI 보조 공정 제어를 통합해 정밀하고 재현성 높은 고기능 적층제조 플랫폼을 구축합니다.',
    '에너지 하베스팅, 탄소 관리, 전기화학 시스템을 위해 분자 설계부터 디바이스 구현까지 연결되는 기능성 소재 플랫폼을 설계하고 실사용 가능한 공학 성능으로 확장합니다.',
    '실시간 바이오센싱, 최소 침습 바이오일렉트로닉스, 적응형 의료 인터페이스를 위한 유연·생체적합 기능성 소재를 설계하고 신뢰성 중심으로 검증합니다.'
  ]
};

function ResearchAreaCard({ card, imagePath, locale }) {
  const [imageIndex, setImageIndex] = useState(0);
  const imageCandidates = mediaCandidates(imagePath);
  const exhausted = imageIndex >= imageCandidates.length;

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-32px_rgba(8,39,70,0.45)] focus-within:-translate-y-1 focus-within:shadow-[0_24px_44px_-32px_rgba(8,39,70,0.45)]">
      {!exhausted ? (
        <img
          alt={card.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          onError={() => setImageIndex((index) => index + 1)}
          src={imageCandidates[imageIndex]}
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
          {locale === 'ko' ? '이미지 준비 중' : 'Image Placeholder'}
        </div>
      )}
      <div className="p-5 md:p-6">
        <div className="h-1.5 w-12 rounded-full bg-[var(--brand-burgundy)]" />
        <h3 className="home-display-subtitle mt-3 text-slate-950">{card.title}</h3>
        <p className="mt-2.5 text-[0.98rem] leading-relaxed text-slate-600 md:text-base">{card.body}</p>
      </div>
    </article>
  );
}

export function HomeResearchAreasSection({ content, locale, revealDelay = 0 }) {
  const cards = (content.cards || []).slice(0, 3).map((card, index) => ({
    ...card,
    body: HOME_RESEARCH_BODY_OVERRIDES[locale]?.[index] || HOME_RESEARCH_BODY_OVERRIDES.en[index] || card.body
  }));
  const title = content.title || (locale === 'ko' ? '연구 분야' : 'Research Area');
  const { ref, revealClassName, revealStyle } = useScrollReveal(revealDelay);

  if (!cards.length) {
    return null;
  }

  return (
    <section className={`space-y-5 ${revealClassName}`} ref={ref} style={revealStyle}>
      <div className="space-y-2.5">
        <h2 className="home-section-title">{title}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <ResearchAreaCard
            card={card}
            imagePath={HOME_MEDIA.researchAreas[index] || HOME_MEDIA.researchAreas[HOME_MEDIA.researchAreas.length - 1]}
            key={card.title}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
