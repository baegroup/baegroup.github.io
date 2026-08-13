import { createSign } from 'node:crypto';

const NOTION_API_VERSION = '2025-09-03';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
].join(' ');
const DASHBOARD_TITLE = '웹사이트 방문자 분석';
const LEGACY_DASHBOARD_TITLES = ['Website Analytics'];
const GA_REPORT_URL = 'https://analytics.google.com/analytics/web/#/a252415216p346894074/reports/intelligenthome';
const SEARCH_CONSOLE_URL = 'https://search.google.com/search-console?resource_id=https%3A%2F%2Fwww.baelab.khu.ac.kr%2F';

function requireEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function createServiceAccountJwt(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = credentials.token_uri || 'https://oauth2.googleapis.com/token';
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64Url(JSON.stringify({
    iss: credentials.client_email,
    scope: GOOGLE_SCOPES,
    aud: tokenUri,
    iat: now,
    exp: now + 3600
  }));
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(credentials.private_key).toString('base64url');
  return { assertion: `${unsignedToken}.${signature}`, tokenUri };
}

async function getGoogleAccessToken(credentials) {
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('GA4_SERVICE_ACCOUNT_JSON must contain client_email and private_key.');
  }

  const { assertion, tokenUri } = createServiceAccountJwt(credentials);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });
  const response = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(`Google OAuth failed (${response.status}): ${data.error_description || data.error || 'Unknown error'}`);
  }
  return data.access_token;
}

async function runGaReport({ accessToken, propertyId, body }) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`GA4 Data API failed (${response.status}): ${data.error?.message || 'Unknown error'}`);
  }
  return data;
}

function isoDateDaysAgo(daysAgo) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

async function runSearchConsoleReport({ accessToken, siteUrl, dimensions }) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate: isoDateDaysAgo(30),
        endDate: isoDateDaysAgo(3),
        dimensions,
        rowLimit: 10,
        dataState: 'final'
      })
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Search Console API failed (${response.status}): ${data.error?.message || 'Unknown error'}`);
  }
  return data;
}

async function notionRequest({ token, endpoint, method = 'GET', body = null }) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Notion API failed (${response.status} ${endpoint}): ${data.message || 'Unknown error'}`);
  }
  return data;
}

function getPageTitle(page) {
  for (const property of Object.values(page.properties || {})) {
    if (property?.type === 'title') {
      return (property.title || []).map((item) => item.plain_text || '').join('').trim();
    }
  }
  return '';
}

async function findOrCreateDashboard({ token, parentDatabaseId }) {
  const parentDatabase = await notionRequest({
    token,
    endpoint: `/databases/${parentDatabaseId}`
  });
  const parentPageId = parentDatabase.parent?.page_id;
  if (!parentPageId) {
    throw new Error('The existing Notion CMS database is not nested under a page. Set NOTION_ANALYTICS_PARENT_PAGE_ID explicitly.');
  }

  const dashboardTitles = [DASHBOARD_TITLE, ...LEGACY_DASHBOARD_TITLES];
  for (const dashboardTitle of dashboardTitles) {
    let cursor = null;
    do {
      const search = await notionRequest({
        token,
        endpoint: '/search',
        method: 'POST',
        body: {
          query: dashboardTitle,
          filter: { property: 'object', value: 'page' },
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {})
        }
      });
      const existing = (search.results || []).find((page) => (
        dashboardTitles.includes(getPageTitle(page)) && page.parent?.page_id === parentPageId
      ));
      if (existing) {
        if (getPageTitle(existing) !== DASHBOARD_TITLE) {
          return notionRequest({
            token,
            endpoint: `/pages/${existing.id}`,
            method: 'PATCH',
            body: {
              icon: { type: 'emoji', emoji: '📊' },
              properties: {
                title: {
                  title: [{ type: 'text', text: { content: DASHBOARD_TITLE } }]
                }
              }
            }
          });
        }
        return existing;
      }
      cursor = search.has_more ? search.next_cursor : null;
    } while (cursor);
  }

  return notionRequest({
    token,
    endpoint: '/pages',
    method: 'POST',
    body: {
      parent: { type: 'page_id', page_id: parentPageId },
      icon: { type: 'emoji', emoji: '📊' },
      properties: {
        title: {
          type: 'title',
          title: [{ type: 'text', text: { content: DASHBOARD_TITLE } }]
        }
      }
    }
  });
}

async function listBlockChildren({ token, blockId }) {
  const results = [];
  let cursor = null;
  do {
    const query = new URLSearchParams({ page_size: '100' });
    if (cursor) query.set('start_cursor', cursor);
    const data = await notionRequest({
      token,
      endpoint: `/blocks/${blockId}/children?${query}`
    });
    results.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

async function replacePageChildren({ token, pageId, children }) {
  const existing = await listBlockChildren({ token, blockId: pageId });
  for (const block of existing) {
    await notionRequest({ token, endpoint: `/blocks/${block.id}`, method: 'DELETE' });
  }
  for (let index = 0; index < children.length; index += 100) {
    await notionRequest({
      token,
      endpoint: `/blocks/${pageId}/children`,
      method: 'PATCH',
      body: { children: children.slice(index, index + 100) }
    });
  }
}

function plainText(content, options = {}) {
  return [{
    type: 'text',
    text: {
      content: String(content ?? ''),
      ...(options.link ? { link: { url: options.link } } : {})
    },
    annotations: {
      bold: Boolean(options.bold),
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: options.color || 'default'
    }
  }];
}

function heading(content, level = 2) {
  const type = `heading_${level}`;
  return { object: 'block', type, [type]: { rich_text: plainText(content) } };
}

function paragraph(content) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: plainText(content) } };
}

function linkedParagraph(label, url) {
  return { object: 'block', type: 'paragraph', paragraph: { rich_text: plainText(label, { link: url }) } };
}

function callout(content, { emoji = 'ℹ️', color = 'gray_background' } = {}) {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: plainText(content),
      icon: { type: 'emoji', emoji },
      color
    }
  };
}

function bulletedItem(content) {
  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: { rich_text: plainText(content) }
  };
}

function toggleBlock(title, children) {
  return {
    object: 'block',
    type: 'toggle',
    toggle: {
      rich_text: plainText(title, { bold: true }),
      children: children.length ? children : [paragraph('표시할 데이터가 아직 없습니다.')]
    }
  };
}

function divider() {
  return { object: 'block', type: 'divider', divider: {} };
}

function metricValue(row, index) {
  return Number(row?.metricValues?.[index]?.value || 0);
}

function dimensionValue(row, index) {
  return String(row?.dimensionValues?.[index]?.value || 'Unknown');
}

function compactNumber(value) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function percentage(value, digits = 1) {
  return `${(Number(value || 0) * 100).toFixed(digits)}%`;
}

function duration(value) {
  const seconds = Math.round(Number(value || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}분 ${remainder}초` : `${remainder}초`;
}

function changeLabel(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);
  if (!previousValue) return currentValue ? '신규' : '변화 없음';
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return `전주 대비 ${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

function rowsFromReport(report, mapper) {
  return (report.rows || []).map(mapper);
}

function topRows(report, limit = 5) {
  return (report.rows || []).slice(0, limit);
}

function joinedList(values) {
  return values.filter(Boolean).join(' · ');
}

function topLabel(report, dimensionIndex = 0) {
  return report.rows?.length ? dimensionValue(report.rows[0], dimensionIndex) : '데이터 없음';
}

function translateVisitorType(value) {
  return ({ new: '신규 방문자', returning: '재방문자', '(not set)': '분류되지 않음' })[String(value).toLowerCase()] || value;
}

function translateCountry(value) {
  return ({
    'South Korea': '대한민국',
    'United States': '미국',
    China: '중국',
    Japan: '일본',
    India: '인도',
    Germany: '독일',
    France: '프랑스',
    Canada: '캐나다',
    Singapore: '싱가포르',
    Taiwan: '대만',
    Australia: '호주',
    Netherlands: '네덜란드',
    'United Kingdom': '영국',
    '(not set)': '분류되지 않음'
  })[value] || value;
}

function translateChannel(value) {
  return ({
    Direct: '직접 방문',
    'Organic Search': '검색 유입',
    Referral: '외부 링크',
    'Organic Social': '소셜 미디어',
    Unassigned: '분류되지 않음'
  })[value] || value;
}

function reportList(report, formatter) {
  return topRows(report).map((row) => bulletedItem(formatter(row)));
}

function buildDashboardBlocks({
  summary,
  previousSummary,
  countries,
  returning,
  channels,
  sources,
  landingPages,
  pages,
  outboundLinks,
  connectionSignals,
  searchSummary,
  searchQueries,
  searchPages,
  updatedAt
}) {
  const current = summary.rows?.[0] || {};
  const previous = previousSummary.rows?.[0] || {};
  const currentMetrics = Array.from({ length: 7 }, (_, index) => metricValue(current, index));
  const previousMetrics = Array.from({ length: 7 }, (_, index) => metricValue(previous, index));
  const signalCounts = new Map(rowsFromReport(connectionSignals, (row) => [
    dimensionValue(row, 0), metricValue(row, 0)
  ]));
  const searchTotals = searchSummary.rows?.[0] || {};
  const periodComparison = [
    `활성 방문자 ${compactNumber(currentMetrics[0])}명 (${changeLabel(currentMetrics[0], previousMetrics[0])})`,
    `신규 방문자 ${compactNumber(currentMetrics[1])}명 (${changeLabel(currentMetrics[1], previousMetrics[1])})`,
    `방문 ${compactNumber(currentMetrics[2])}회 (${changeLabel(currentMetrics[2], previousMetrics[2])})`,
    `페이지 조회 ${compactNumber(currentMetrics[3])}회 (${changeLabel(currentMetrics[3], previousMetrics[3])})`,
    `참여 세션 ${compactNumber(currentMetrics[6])}회 (${changeLabel(currentMetrics[6], previousMetrics[6])})`
  ];
  const connectionSummary = [
    `모집 안내 관심 ${compactNumber(signalCounts.get('recruitment_interest'))}회`,
    `지원 이메일 클릭 ${compactNumber(signalCounts.get('application_intent'))}회`,
    `연락 이메일 클릭 ${compactNumber(signalCounts.get('contact_intent'))}회`,
    `연구자 프로필 클릭 ${compactNumber(signalCounts.get('research_profile_interest'))}회`,
    `논문 링크 클릭 ${compactNumber(signalCounts.get('publication_interest'))}회`
  ];
  const topCountry = translateCountry(topLabel(countries));
  const topChannel = translateChannel(topLabel(channels));
  const topPage = topLabel(pages);
  const topQuery = String(searchQueries.rows?.[0]?.keys?.[0] || '아직 검색어 데이터가 없습니다');

  return [
    heading(DASHBOARD_TITLE, 1),
    callout(`업데이트: ${updatedAt} · 최근 7일 기준 · Analytics에 동의한 방문자의 집계 데이터만 포함합니다.`, {
      emoji: '🕘'
    }),
    heading('한눈에 보기', 2),
    paragraph(`최근 7일 동안 ${compactNumber(currentMetrics[0])}명이 ${compactNumber(currentMetrics[2])}회 방문해 ${compactNumber(currentMetrics[3])}개의 페이지를 조회했습니다. 가장 많은 방문 국가는 ${topCountry}, 주요 유입 경로는 ${topChannel}입니다.`),
    callout(`방문자  ${compactNumber(currentMetrics[0])}명 · 신규 ${compactNumber(currentMetrics[1])}명 · ${changeLabel(currentMetrics[0], previousMetrics[0])}`, {
      emoji: '👥', color: 'blue_background'
    }),
    callout(`이용량  방문 ${compactNumber(currentMetrics[2])}회 · 페이지 조회 ${compactNumber(currentMetrics[3])}회`, {
      emoji: '📈', color: 'green_background'
    }),
    callout(`참여도  참여율 ${percentage(currentMetrics[4])} · 평균 체류 ${duration(currentMetrics[5])}`, {
      emoji: '⏱️', color: 'yellow_background'
    }),
    callout(`Google 검색(확정 28일)  클릭 ${compactNumber(searchTotals.clicks)}회 · 노출 ${compactNumber(searchTotals.impressions)}회 · 평균 ${Number(searchTotals.position || 0).toFixed(1)}위`, {
      emoji: '🔎', color: 'purple_background'
    }),
    divider(),
    heading('연구 연결 가능성', 2),
    paragraph('모집, 공동연구, 연구자 정보 및 논문에 관심을 보인 행동을 개인정보 없이 합산한 수치입니다.'),
    callout(joinedList(connectionSummary), { emoji: '🤝', color: 'gray_background' }),
    divider(),
    heading('세부 정보', 2),
    paragraph(`가장 많이 본 페이지는 ${topPage}, 대표 Google 검색어는 “${topQuery}”입니다. 필요한 항목만 펼쳐서 확인하세요.`),
    toggleBlock('지난주와 비교', periodComparison.map(bulletedItem)),
    toggleBlock('방문 국가와 신규·재방문', [
      heading('방문 국가 상위 5개', 3),
      ...reportList(countries, (row) => `${translateCountry(dimensionValue(row, 0))} · 방문자 ${compactNumber(metricValue(row, 0))}명 · 방문 ${compactNumber(metricValue(row, 1))}회`),
      heading('신규·재방문', 3),
      ...reportList(returning, (row) => `${translateVisitorType(dimensionValue(row, 0))} · ${compactNumber(metricValue(row, 0))}명`)
    ]),
    toggleBlock('방문 경로와 첫 진입 페이지', [
      heading('유입 채널 상위 5개', 3),
      ...reportList(channels, (row) => `${translateChannel(dimensionValue(row, 0))} · 방문 ${compactNumber(metricValue(row, 0))}회 · 방문자 ${compactNumber(metricValue(row, 1))}명`),
      heading('상세 출처 상위 5개', 3),
      ...reportList(sources, (row) => `${dimensionValue(row, 0)} · 방문 ${compactNumber(metricValue(row, 0))}회`),
      heading('첫 진입 페이지 상위 5개', 3),
      ...reportList(landingPages, (row) => `${dimensionValue(row, 0)} · 방문 ${compactNumber(metricValue(row, 0))}회 · 방문자 ${compactNumber(metricValue(row, 1))}명`)
    ]),
    toggleBlock('많이 본 페이지와 외부 링크', [
      heading('조회 페이지 상위 5개', 3),
      ...reportList(pages, (row) => `${dimensionValue(row, 0)} · 조회 ${compactNumber(metricValue(row, 0))}회 · 방문자 ${compactNumber(metricValue(row, 1))}명`),
      heading('외부 연구 링크 상위 5개', 3),
      ...reportList(outboundLinks, (row) => `${dimensionValue(row, 0)} · 클릭 ${compactNumber(metricValue(row, 0))}회`)
    ]),
    toggleBlock('Google 검색 상세', [
      paragraph(`최근 확정 28일 · 클릭 ${compactNumber(searchTotals.clicks)}회 · 노출 ${compactNumber(searchTotals.impressions)}회 · 클릭률 ${percentage(searchTotals.ctr)} · 평균 ${Number(searchTotals.position || 0).toFixed(1)}위`),
      heading('검색어 상위 5개', 3),
      ...topRows(searchQueries).map((row) => bulletedItem(
        `${String(row.keys?.[0] || '검색어 없음')} · 클릭 ${compactNumber(row.clicks)} · 노출 ${compactNumber(row.impressions)} · ${Number(row.position || 0).toFixed(1)}위`
      )),
      heading('검색 유입 페이지 상위 5개', 3),
      ...topRows(searchPages).map((row) => bulletedItem(
        `${String(row.keys?.[0] || '페이지 없음')} · 클릭 ${compactNumber(row.clicks)} · 노출 ${compactNumber(row.impressions)} · ${Number(row.position || 0).toFixed(1)}위`
      ))
    ]),
    divider(),
    heading('원본 데이터', 2),
    paragraph('더 자세한 분석이 필요한 경우 아래 원본 서비스에서 확인할 수 있습니다.'),
    linkedParagraph('Google Analytics 열기', GA_REPORT_URL),
    linkedParagraph('Google Search Console 열기', SEARCH_CONSOLE_URL)
  ];
}

async function collectAnalytics({ accessToken, propertyId, searchConsoleSiteUrl }) {
  const summaryMetrics = [
    'activeUsers', 'newUsers', 'sessions', 'screenPageViews',
    'engagementRate', 'averageSessionDuration', 'engagedSessions'
  ].map((name) => ({ name }));
  const report = (body) => runGaReport({ accessToken, propertyId, body });
  const baseDate = { startDate: '7daysAgo', endDate: 'yesterday' };
  const limit = '10';

  const [
    summary, previousSummary, countries, returning, channels, sources, landingPages,
    pages, outboundLinks, connectionSignals, searchSummary, searchQueries, searchPages
  ] = await Promise.all([
    report({ dateRanges: [baseDate], metrics: summaryMetrics }),
    report({ dateRanges: [{ startDate: '14daysAgo', endDate: '8daysAgo' }], metrics: summaryMetrics }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'newVsReturning' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'pagePathPlusQueryString' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'linkDomain' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: { filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'click' } } },
      orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }], limit
    }),
    report({
      dateRanges: [baseDate], dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: [
              'recruitment_interest', 'application_intent', 'contact_intent',
              'research_profile_interest', 'publication_interest'
            ]
          }
        }
      },
      limit
    }),
    runSearchConsoleReport({ accessToken, siteUrl: searchConsoleSiteUrl, dimensions: [] }),
    runSearchConsoleReport({ accessToken, siteUrl: searchConsoleSiteUrl, dimensions: ['query'] }),
    runSearchConsoleReport({ accessToken, siteUrl: searchConsoleSiteUrl, dimensions: ['page'] })
  ]);

  return {
    summary, previousSummary, countries, returning, channels, sources, landingPages,
    pages, outboundLinks, connectionSignals, searchSummary, searchQueries, searchPages
  };
}

async function main() {
  const notionToken = requireEnv('NOTION_TOKEN');
  const notionNewsDatabaseId = requireEnv('NOTION_NEWS_DB_ID');
  const propertyId = requireEnv('GA4_PROPERTY_ID');
  const searchConsoleSiteUrl = String(process.env.SEARCH_CONSOLE_SITE_URL || 'https://www.baelab.khu.ac.kr/').trim();
  const credentials = JSON.parse(requireEnv('GA4_SERVICE_ACCOUNT_JSON'));
  const accessToken = await getGoogleAccessToken(credentials);
  const analytics = await collectAnalytics({ accessToken, propertyId, searchConsoleSiteUrl });
  const dashboard = await findOrCreateDashboard({ token: notionToken, parentDatabaseId: notionNewsDatabaseId });
  const updatedAt = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date());
  const children = buildDashboardBlocks({ ...analytics, updatedAt });
  await replacePageChildren({ token: notionToken, pageId: dashboard.id, children });
  console.log(`Analytics dashboard updated: ${dashboard.url}`);
}

main().catch((error) => {
  console.error(`[analytics-sync] ${error.message}`);
  process.exitCode = 1;
});
