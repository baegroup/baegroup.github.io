import { createSign } from 'node:crypto';

const NOTION_API_VERSION = '2025-09-03';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
].join(' ');
const DASHBOARD_TITLE = 'Website Analytics';
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

  let cursor = null;
  do {
    const search = await notionRequest({
      token,
      endpoint: '/search',
      method: 'POST',
      body: {
        query: DASHBOARD_TITLE,
        filter: { property: 'object', value: 'page' },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {})
      }
    });
    const existing = (search.results || []).find((page) => (
      getPageTitle(page) === DASHBOARD_TITLE && page.parent?.page_id === parentPageId
    ));
    if (existing) {
      return existing;
    }
    cursor = search.has_more ? search.next_cursor : null;
  } while (cursor);

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

function tableBlock(headers, rows) {
  const cells = [headers, ...rows].map((row, rowIndex) => ({
    object: 'block',
    type: 'table_row',
    table_row: {
      cells: row.map((value) => plainText(value, { bold: rowIndex === 0 }))
    }
  }));
  return {
    object: 'block',
    type: 'table',
    table: {
      table_width: headers.length,
      has_column_header: true,
      has_row_header: false,
      children: cells
    }
  };
}

function callout(content) {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: plainText(content),
      icon: { type: 'emoji', emoji: 'ℹ️' },
      color: 'gray_background'
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
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function percentage(value, digits = 1) {
  return `${(Number(value || 0) * 100).toFixed(digits)}%`;
}

function duration(value) {
  const seconds = Math.round(Number(value || 0));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes}m ${remainder}s` : `${remainder}s`;
}

function changeLabel(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);
  if (!previousValue) return currentValue ? 'New' : '—';
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

function rowsFromReport(report, mapper) {
  return (report.rows || []).map(mapper);
}

function searchRows(report, keyLabel = 'Unknown') {
  return (report.rows || []).map((row) => [
    String(row.keys?.[0] || keyLabel),
    compactNumber(row.clicks),
    compactNumber(row.impressions),
    percentage(row.ctr),
    Number(row.position || 0).toFixed(1)
  ]);
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
  const metricRows = [
    ['Active users', compactNumber(currentMetrics[0]), compactNumber(previousMetrics[0]), changeLabel(currentMetrics[0], previousMetrics[0])],
    ['New users', compactNumber(currentMetrics[1]), compactNumber(previousMetrics[1]), changeLabel(currentMetrics[1], previousMetrics[1])],
    ['Sessions', compactNumber(currentMetrics[2]), compactNumber(previousMetrics[2]), changeLabel(currentMetrics[2], previousMetrics[2])],
    ['Page views', compactNumber(currentMetrics[3]), compactNumber(previousMetrics[3]), changeLabel(currentMetrics[3], previousMetrics[3])],
    ['Engagement rate', percentage(currentMetrics[4]), percentage(previousMetrics[4]), changeLabel(currentMetrics[4], previousMetrics[4])],
    ['Avg. session duration', duration(currentMetrics[5]), duration(previousMetrics[5]), changeLabel(currentMetrics[5], previousMetrics[5])],
    ['Engaged sessions', compactNumber(currentMetrics[6]), compactNumber(previousMetrics[6]), changeLabel(currentMetrics[6], previousMetrics[6])]
  ];
  const signalCounts = new Map(rowsFromReport(connectionSignals, (row) => [
    dimensionValue(row, 0), metricValue(row, 0)
  ]));
  const signalRows = [
    ['Recruitment interest', compactNumber(signalCounts.get('recruitment_interest'))],
    ['Application email intent', compactNumber(signalCounts.get('application_intent'))],
    ['Contact email intent', compactNumber(signalCounts.get('contact_intent'))],
    ['Research profile interest', compactNumber(signalCounts.get('research_profile_interest'))],
    ['Publication interest', compactNumber(signalCounts.get('publication_interest'))]
  ];
  const searchTotals = searchSummary.rows?.[0] || {};

  return [
    heading(DASHBOARD_TITLE, 1),
    callout(`Last updated ${updatedAt} · GA4 data is consent-based and excludes visitors who decline Analytics.`),
    heading('Last 7 Days', 2),
    tableBlock(['Metric', 'Current', 'Previous', 'Change'], metricRows),
    divider(),
    heading('Connection Signals', 2),
    paragraph('Aggregate actions that indicate possible collaboration, recruitment, or research interest.'),
    tableBlock(['Signal', 'Last 7 days'], signalRows),
    heading('Google Search Discovery', 2),
    tableBlock(['Period', 'Clicks', 'Impressions', 'CTR', 'Avg. position'], [[
      'Last 28 final days', compactNumber(searchTotals.clicks), compactNumber(searchTotals.impressions),
      percentage(searchTotals.ctr), Number(searchTotals.position || 0).toFixed(1)
    ]]),
    tableBlock(['Search query', 'Clicks', 'Impressions', 'CTR', 'Position'], searchRows(searchQueries)),
    heading('Search Landing Pages', 3),
    tableBlock(['Page', 'Clicks', 'Impressions', 'CTR', 'Position'], searchRows(searchPages)),
    divider(),
    heading('Visitor Countries', 2),
    tableBlock(['Country', 'Active users', 'Sessions'], rowsFromReport(countries, (row) => [
      dimensionValue(row, 0), compactNumber(metricValue(row, 0)), compactNumber(metricValue(row, 1))
    ])),
    heading('New vs. Returning', 3),
    tableBlock(['Visitor type', 'Active users'], rowsFromReport(returning, (row) => [
      dimensionValue(row, 0), compactNumber(metricValue(row, 0))
    ])),
    heading('Traffic Channels', 2),
    tableBlock(['Channel', 'Sessions', 'Active users'], rowsFromReport(channels, (row) => [
      dimensionValue(row, 0), compactNumber(metricValue(row, 0)), compactNumber(metricValue(row, 1))
    ])),
    heading('Traffic Sources', 2),
    tableBlock(['Source / medium', 'Sessions'], rowsFromReport(sources, (row) => [
      dimensionValue(row, 0), compactNumber(metricValue(row, 0))
    ])),
    heading('Entry Pages', 3),
    tableBlock(['Landing page', 'Sessions', 'Users'], rowsFromReport(landingPages, (row) => [
      dimensionValue(row, 0), compactNumber(metricValue(row, 0)), compactNumber(metricValue(row, 1))
    ])),
    heading('Most Viewed Pages', 2),
    tableBlock(['Page', 'Title', 'Views', 'Users'], rowsFromReport(pages, (row) => [
      dimensionValue(row, 0), dimensionValue(row, 1), compactNumber(metricValue(row, 0)), compactNumber(metricValue(row, 1))
    ])),
    heading('Outbound Research Destinations', 3),
    tableBlock(['Destination domain', 'Clicks'], rowsFromReport(outboundLinks, (row) => [
      dimensionValue(row, 0), compactNumber(metricValue(row, 0))
    ])),
    divider(),
    paragraph('Use the source systems below for detailed exploration and search-query performance.'),
    linkedParagraph('Open Google Analytics', GA_REPORT_URL),
    linkedParagraph('Open Google Search Console', SEARCH_CONSOLE_URL)
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
  const updatedAt = new Intl.DateTimeFormat('en-CA', {
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
