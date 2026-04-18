export interface Highlight {
  id: number;
  emoji: string;
  title: string;
  summary: string;
}

export interface MarketItem {
  name: string;
  code: string;
  price: number;
  change: number;
  region: string;
  sparkline?: number[];
}

export interface MacroItem {
  id: number;
  title: string;
  summary: string;
  tag: string;
  sentiment: "positive" | "negative" | "neutral";
}

export interface OverseasItem {
  id: number;
  source: string;
  title: string;
  summary: string;
  region: string;
  publishedAt?: string;
}

export interface IndustryHighlight {
  id: number;
  title: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  publishedAt?: string;
}

export interface IndustrySector {
  title: string;
  icon: string;
  highlights: IndustryHighlight[];
}

export interface IndustryFocus {
  healthcare: IndustrySector;
  energy: IndustrySector;
}

export interface PremarketSignal {
  id: number;
  category: string;
  signal: string;
  direction: "bullish" | "bearish" | "neutral";
}

export interface OverallSentiment {
  emoji: string;
  phrase: string;
}

export interface MarketImpactItem {
  id: number;
  event: string; // 关键事件描述
  chinaImpact: string; // 对A股的影响分析
  hkImpact: string; // 对港股的影响分析
  affectedSectors: string[]; // 受影响板块
  sentiment: "positive" | "negative" | "neutral";
}

export interface MarketImpactAnalysis {
  summary: string; // 一句话总结今日对CN/HK股市的整体影响
  items: MarketImpactItem[];
}

export interface Edition {
  meta: {
    date: string;
    edition: string;
    greeting: string;
  };
  overallSentiment?: OverallSentiment;
  todayHighlights: Highlight[];
  globalMarkets: MarketItem[];
  macroPulse: MacroItem[];
  overseasPerspective: OverseasItem[];
  industryFocus: IndustryFocus;
  premarketSignals: PremarketSignal[];
  marketImpactAnalysis?: MarketImpactAnalysis;
}
