import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

const CATEGORIES = [
  {
    id: "building",
    name: "建物維持力",
    icon: "🏗️",
    desc: "物理的に維持できるか",
    questions: [
      { text: "築年数はどのくらいですか？", options: ["10年未満", "10〜20年", "20〜30年", "30〜40年", "40年以上"], scores: [5,4,3,2,1] },
      { text: "配管・給排水設備の更新状況は？", options: ["更新済み", "更新予定あり", "未確認", "更新未定", "老朽化が深刻"], scores: [5,4,3,2,1] },
      { text: "長期修繕計画はありますか？", options: ["あり・定期見直しあり", "あり・見直しなし", "あるか不明", "ない", "存在しない"], scores: [5,4,3,2,1] },
      { text: "耐震性はどうですか？", options: ["新耐震+補強済み", "新耐震基準（1981年以降）", "旧耐震だが診断済み", "旧耐震・未診断", "旧耐震・問題あり"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "finance",
    name: "金融維持力",
    icon: "💴",
    desc: "70〜90歳でも払い続けられるか",
    questions: [
      { text: "住宅ローンの残高状況は？", options: ["完済済み", "残り5年以内", "残り10年以内", "残り20年以上", "返済が厳しい"], scores: [5,4,3,2,1] },
      { text: "管理費・修繕積立金の負担感は？", options: ["余裕あり", "問題ない", "少し重い", "かなり重い", "払えなくなる可能性"], scores: [5,4,3,2,1] },
      { text: "老後の収入見通しは？", options: ["年金+資産で十分", "年金で概ねカバー", "やや不安", "かなり不安", "ほぼ見通せない"], scores: [5,4,3,2,1] },
      { text: "修繕積立金は将来の大規模修繕に足りそうですか？", options: ["十分", "おそらく足りる", "不明", "不足気味", "明らかに不足"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "mobility",
    name: "移動維持力",
    icon: "🚶",
    desc: "年を取っても移動できるか",
    questions: [
      { text: "最寄り駅まで徒歩何分ですか？", options: ["5分以内", "10分以内", "15分以内", "20分以内", "20分超または駅なし"], scores: [5,4,3,2,1] },
      { text: "坂道・段差の多さは？", options: ["ほぼフラット", "少し坂あり", "坂あり", "急坂あり", "高齢者には厳しい"], scores: [5,4,3,2,1] },
      { text: "スーパー・病院への移動手段は？", options: ["徒歩圏内", "自転車で行ける", "バスで行ける", "車が必要", "車がないと詰む"], scores: [5,4,3,2,1] },
      { text: "エレベーターの有無（マンションの場合）", options: ["あり・問題なし", "あり・老朽化あり", "低層で不要", "なし・2階以下", "なし・3階以上"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "region",
    name: "地域維持力",
    icon: "🏘️",
    desc: "街が20年後も生きているか",
    questions: [
      { text: "地域の人口トレンドは？", options: ["増加中", "横ばい", "やや減少", "減少が続いている", "急激に減少"], scores: [5,4,3,2,1] },
      { text: "近隣の商業施設の状況は？", options: ["活況", "安定", "やや空き店舗あり", "シャッター街化", "撤退が相次いでいる"], scores: [5,4,3,2,1] },
      { text: "公共交通（バス・電車）の状況は？", options: ["充実・維持される見込み", "現状維持", "本数減少中", "廃線・廃止の噂あり", "すでに廃止・激減"], scores: [5,4,3,2,1] },
      { text: "空き家・廃墟の状況は？", options: ["ほぼなし", "少しある", "目立つ", "多い", "街全体が空洞化"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "management",
    name: "管理維持力",
    icon: "🏢",
    desc: "管理組合が機能するか（マンションの場合）",
    questions: [
      { text: "管理組合の総会への参加状況は？", options: ["活発・高出席率", "まあまあ", "低調", "ほぼ機能していない", "戸建て・該当なし"], scores: [5,4,3,2,1] },
      { text: "管理費の滞納状況は？", options: ["滞納なし", "ごく少数", "一定数あり", "多い", "深刻な状況"], scores: [5,4,3,2,1] },
      { text: "理事のなり手は？", options: ["十分いる", "なんとかなっている", "苦労している", "ほぼいない", "完全に機能不全"], scores: [5,4,3,2,1] },
      { text: "管理会社との関係は？", options: ["対等に機能", "概ね任せている", "ほぼ丸投げ", "不満あり", "トラブルあり"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "resale",
    name: "売却維持力",
    icon: "🔑",
    desc: "出口があるか",
    questions: [
      { text: "近隣の不動産取引の活発さは？", options: ["活発", "まあまあ", "低調", "ほぼ動いていない", "売れない"], scores: [5,4,3,2,1] },
      { text: "賃貸需要はありそうですか？", options: ["高い", "まあある", "やや低い", "低い", "ほぼない"], scores: [5,4,3,2,1] },
      { text: "駅力・エリアの将来性は？", options: ["再開発など期待大", "安定", "横ばい", "衰退傾向", "地方衰退エリア"], scores: [5,4,3,2,1] },
      { text: "今すぐ売ったら買い手はいると思いますか？", options: ["すぐ売れる", "数ヶ月で売れる", "半年〜1年かかる", "1年以上かかる", "売れる自信がない"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "disaster",
    name: "災害維持力",
    icon: "🛡️",
    desc: "災害後も住み続けられるか",
    questions: [
      { text: "ハザードマップ上の浸水リスクは？", options: ["リスクなし", "低リスク", "中リスク", "高リスク", "確認していない"], scores: [5,4,3,2,1] },
      { text: "液状化・土砂災害のリスクは？", options: ["なし", "低い", "中程度", "高い", "確認していない"], scores: [5,4,3,2,1] },
      { text: "避難所・避難経路の確認は？", options: ["確認済み・近い", "確認済み", "なんとなく知っている", "未確認", "徒歩避難が困難"], scores: [5,4,3,2,1] },
      { text: "備蓄・防災対策の状況は？", options: ["十分な備蓄あり", "ある程度あり", "少しある", "ほぼない", "全くない"], scores: [5,4,3,2,1] },
    ]
  },
  {
    id: "aging",
    name: "老後維持力",
    icon: "🌿",
    desc: "老後に詰まないか",
    questions: [
      { text: "医療機関へのアクセスは？", options: ["徒歩圏内に複数あり", "自転車で行ける", "バスで行ける", "車が必要", "車なしでは困難"], scores: [5,4,3,2,1] },
      { text: "家族・子世代の距離感は？", options: ["同居または徒歩圏", "車で30分以内", "1〜2時間", "遠方", "疎遠・頼れない"], scores: [5,4,3,2,1] },
      { text: "住居内の段差・階段の状況は？", options: ["バリアフリー済み", "改修可能", "段差あるが軽微", "階段必須", "車椅子では無理"], scores: [5,4,3,2,1] },
      { text: "孤立リスクは？", options: ["地域コミュニティ活発", "近所付き合いあり", "少しある", "ほぼ孤立", "完全に孤立"], scores: [5,4,3,2,1] },
    ]
  },
];

const TYPE_RULES = [
  {
    id: "mobility_aging",
    name: "老後移動困難型",
    emoji: "🚶‍♂️",
    condition: (s) => s.mobility <= 40 && s.aging <= 40,
    desc: "移動手段と老後の生活基盤に深刻なリスクがあります。80歳以降の生活が詰む可能性が高い状態です。",
    strategies: ["早期住み替えの検討", "駅近・平坦エリアへの移転", "買い物・医療導線の改善", "車依存からの脱却計画"],
  },
  {
    id: "building_management",
    name: "管理崩壊注意型",
    emoji: "🏚️",
    condition: (s) => s.building <= 40 && s.management <= 40,
    desc: "建物の老朽化と管理組合の機能不全が重なっており、将来的に大規模修繕が困難になる恐れがあります。",
    strategies: ["修繕積立金の状況を今すぐ確認", "管理組合の再活性化", "売却時期の早期検討", "専門家による建物診断"],
  },
  {
    id: "region_resale",
    name: "出口消失型",
    emoji: "🚪",
    condition: (s) => s.region <= 35 && s.resale <= 35,
    desc: "地域の衰退と売却難易度の上昇が重なっています。将来、売りたくても売れない状況に陥るリスクがあります。",
    strategies: ["早期売却の真剣な検討", "賃貸化による収益確保", "地域活性化への関与", "資産価値の客観的査定"],
  },
  {
    id: "finance_risk",
    name: "金融爆発型",
    emoji: "💣",
    condition: (s) => s.finance <= 40,
    desc: "老後の収支バランスに深刻なリスクがあります。今の収入が続く前提での計画は危険です。",
    strategies: ["ファイナンシャルプランナーへの相談", "ダウンサイジング住み替え", "管理費・積立金の見直し交渉", "収入源の多様化"],
  },
  {
    id: "disaster_risk",
    name: "災害脆弱型",
    emoji: "⚠️",
    condition: (s) => s.disaster <= 35,
    desc: "災害時に住み続けられなくなるリスクが高い状態です。",
    strategies: ["ハザードマップの再確認", "防災備蓄の強化", "避難計画の策定", "保険の見直し"],
  },
];

const STRATEGIES = [
  { id: "sell", label: "早期売却", emoji: "📋", desc: "資産価値が下がる前に売却し、より維持可能な住まいへ移る" },
  { id: "rent", label: "賃貸化", emoji: "🏠", desc: "自宅を賃貸に出し、自分は身軽に暮らす選択肢" },
  { id: "downsize", label: "コンパクト住み替え", emoji: "📦", desc: "駅近・バリアフリーの小さな住まいへ移る" },
  { id: "nearfamily", label: "子世代近居", emoji: "👨‍👩‍👧", desc: "子どもや家族の近くに引っ越し、支え合う体制を作る" },
  { id: "terminal", label: "終の住処化", emoji: "🌱", desc: "今の住まいを改修・強化して、最後まで住み続ける" },
];

function getRecommendedStrategy(scores) {
  const avg = Object.values(scores).reduce((a,b)=>a+b,0)/8;
  if (scores.resale <= 35 && scores.region <= 35) return "sell";
  if (avg >= 65 && scores.building >= 50) return "terminal";
  if (scores.aging <= 40 || scores.mobility <= 40) return "downsize";
  if (scores.finance <= 40) return "rent";
  return "nearfamily";
}

export default function App() {
  const [phase, setPhase] = useState("intro"); // intro | questions | result
  const [catIdx, setCatIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});

  const totalQ = CATEGORIES.reduce((a,c)=>a+c.questions.length,0);
  const answeredQ = Object.keys(answers).length;
  const progress = Math.round((answeredQ / totalQ) * 100);

  function handleAnswer(score) {
    const key = `${catIdx}-${qIdx}`;
    const newAnswers = { ...answers, [key]: score };
    setAnswers(newAnswers);

    const cat = CATEGORIES[catIdx];
    if (qIdx < cat.questions.length - 1) {
      setQIdx(qIdx + 1);
    } else if (catIdx < CATEGORIES.length - 1) {
      setCatIdx(catIdx + 1);
      setQIdx(0);
    } else {
      // Calculate scores
      const newScores = {};
      CATEGORIES.forEach((c, ci) => {
        const total = c.questions.reduce((sum, _, qi) => {
          const ans = newAnswers[`${ci}-${qi}`];
          return sum + (ans !== undefined ? ans : 3);
        }, 0);
        newScores[c.id] = Math.round((total / (c.questions.length * 5)) * 100);
      });
      setScores(newScores);
      setPhase("result");
    }
  }

  function goBack() {
    if (qIdx > 0) {
      setQIdx(qIdx - 1);
    } else if (catIdx > 0) {
      const prevCat = CATEGORIES[catIdx - 1];
      setCatIdx(catIdx - 1);
      setQIdx(prevCat.questions.length - 1);
    }
  }

  const radarData = CATEGORIES.map(c => ({
    subject: c.name.replace("維持力",""),
    value: scores[c.id] || 0,
    fullMark: 100,
  }));

  const detectedTypes = TYPE_RULES.filter(r => r.condition(scores));
  const recommendedStrategy = getRecommendedStrategy(scores);
  const overallScore = scores && Object.keys(scores).length > 0
    ? Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/8)
    : 0;

  // ---------- INTRO ----------
  if (phase === "intro") return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.badge}>住まい診断</div>
        <h1 style={styles.title}>20〜30年、<br/>生き残れますか？</h1>
        <p style={styles.subtitle}>
          建物・お金・移動・地域・管理・売却・災害・老後。<br/>
          8つの維持力で、あなたの住まいの「本当のリスク」を診断します。
        </p>
        <div style={styles.infoRow}>
          <span style={styles.infoItem}>⏱ 約5〜8分</span>
          <span style={styles.infoItem}>📋 32問</span>
          <span style={styles.infoItem}>📊 レーダーチャート付き</span>
        </div>
        <button style={styles.startBtn} onClick={() => setPhase("questions")}>
          診断をはじめる →
        </button>
        <p style={styles.note}>※回答データは外部に送信されません</p>
      </div>
    </div>
  );

  // ---------- QUESTIONS ----------
  if (phase === "questions") {
    const cat = CATEGORIES[catIdx];
    const q = cat.questions[qIdx];
    const currentKey = `${catIdx}-${qIdx}`;
    const answered = answers[currentKey] !== undefined;

    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          {/* Progress */}
          <div style={styles.progressWrap}>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${progress}%`}} />
            </div>
            <span style={styles.progressText}>{answeredQ}/{totalQ}</span>
          </div>

          {/* Category */}
          <div style={styles.catHeader}>
            <span style={styles.catIcon}>{cat.icon}</span>
            <div>
              <div style={styles.catName}>{cat.name}</div>
              <div style={styles.catDesc}>{cat.desc}</div>
            </div>
          </div>

          {/* Question */}
          <div style={styles.qBox}>
            <div style={styles.qNum}>Q{qIdx+1} / {cat.questions.length}</div>
            <div style={styles.qText}>{q.text}</div>
          </div>

          {/* Options */}
          <div style={styles.optionList}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                style={{
                  ...styles.optionBtn,
                  ...(answers[currentKey] === q.scores[i] ? styles.optionSelected : {}),
                }}
                onClick={() => handleAnswer(q.scores[i])}
              >
                <span style={styles.optionDot}>{["①","②","③","④","⑤"][i]}</span>
                {opt}
              </button>
            ))}
          </div>

          {/* Back */}
          {(catIdx > 0 || qIdx > 0) && (
            <button style={styles.backBtn} onClick={goBack}>← 前の質問に戻る</button>
          )}
        </div>
      </div>
    );
  }

  // ---------- RESULT ----------
  const scoreColor = (s) => s >= 70 ? "#4ade80" : s >= 50 ? "#facc15" : "#f87171";

  return (
    <div style={styles.bg}>
      <div style={{...styles.card, maxWidth: 680}}>
        <div style={styles.badge}>診断結果</div>
        <h2 style={styles.title}>総合スコア</h2>

        {/* Overall score */}
        <div style={styles.scoreCircle}>
          <span style={{...styles.scoreNum, color: scoreColor(overallScore)}}>{overallScore}</span>
          <span style={styles.scoreLabel}>/ 100</span>
        </div>

        {/* Radar Chart */}
        <div style={{width:"100%", height:280, margin:"16px 0"}}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="subject" tick={{fill:"#475569", fontSize:11}} />
              <Radar dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 8 Scores */}
        <div style={styles.scoreGrid}>
          {CATEGORIES.map(c => (
            <div key={c.id} style={styles.scoreItem}>
              <div style={styles.scoreItemIcon}>{c.icon}</div>
              <div style={styles.scoreItemName}>{c.name}</div>
              <div style={{...styles.scoreItemVal, color: scoreColor(scores[c.id]||0)}}>
                {scores[c.id]||0}
              </div>
              <div style={styles.scoreBar}>
                <div style={{
                  ...styles.scoreBarFill,
                  width: `${scores[c.id]||0}%`,
                  background: scoreColor(scores[c.id]||0)
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Detected types */}
        {detectedTypes.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>⚠️ 検出されたリスクタイプ</h3>
            {detectedTypes.map(t => (
              <div key={t.id} style={styles.typeCard}>
                <div style={styles.typeName}>{t.emoji} {t.name}</div>
                <p style={styles.typeDesc}>{t.desc}</p>
                <div style={styles.strategyList}>
                  {t.strategies.map((s,i) => (
                    <div key={i} style={styles.strategyItem}>✓ {s}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {detectedTypes.length === 0 && (
          <div style={{...styles.typeCard, borderColor:"#4ade80"}}>
            <div style={styles.typeName}>✅ 大きなリスクタイプは検出されませんでした</div>
            <p style={styles.typeDesc}>現時点では重大なリスクの組み合わせは見られません。ただし、スコアが低い項目は継続的に注意が必要です。</p>
          </div>
        )}

        {/* Recommended Strategy */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🧭 推奨される生存戦略</h3>

          {/* TOP PICK */}
          {STRATEGIES.filter(s => s.id === recommendedStrategy).map(s => (
            <div key={s.id} style={styles.topPickCard}>
              <div style={styles.topPickBadge}>★ あなたへのおすすめ</div>
              <div style={styles.topPickInner}>
                <span style={styles.topPickEmoji}>{s.emoji}</span>
                <div>
                  <div style={styles.topPickLabel}>{s.label}</div>
                  <div style={styles.topPickDesc}>{s.desc}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Other options */}
          <div style={styles.otherLabel}>その他の選択肢</div>
          {STRATEGIES.filter(s => s.id !== recommendedStrategy).map(s => (
            <div key={s.id} style={styles.strategyCard}>
              <span style={styles.strategyEmoji}>{s.emoji}</span>
              <div>
                <div style={styles.strategyLabel}>{s.label}</div>
                <div style={styles.strategyDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* LINE CTA */}
        <div style={styles.lineCtaBox}>
          <div style={styles.lineCtaText}>
            <div style={styles.lineCtaTitle}>📩 この結果の詳しい解説を受け取る</div>
            <div style={styles.lineCtaDesc}>診断タイプ別の解説・対策をLINEでお届けします。無料です。</div>
          </div>
          <a
            href="https://line.me/R/ti/p/@148cciyn"
            style={styles.lineBtn}
          >
            <span style={styles.lineBtnIcon}>💬</span>
            LINEで解説を受け取る
          </a>
          <div style={styles.lineNote}>✅ お友達追加で解説をお受け取りいただけます</div>
        </div>

        {/* Retry */}
        <button style={styles.startBtn} onClick={() => {
          setPhase("intro"); setCatIdx(0); setQIdx(0); setAnswers({}); setScores({});
        }}>
          もう一度診断する
        </button>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "#f0f4f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "24px 16px",
    fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: "32px 28px",
    width: "100%",
    maxWidth: 560,
    color: "#1e293b",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  badge: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    borderRadius: 999,
    padding: "4px 14px",
    fontSize: 12,
    marginBottom: 16,
    letterSpacing: "0.08em",
    fontWeight: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.4,
    margin: "0 0 12px",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.8,
    margin: "0 0 20px",
  },
  infoRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  infoItem: {
    fontSize: 13,
    color: "#334155",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "6px 12px",
    borderRadius: 8,
  },
  lineNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#166534",
    marginTop: 10,
  },
  lineCtaBox: {
    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    border: "2px solid #4ade80",
    borderRadius: 16,
    padding: "20px",
    marginTop: 28,
    marginBottom: 12,
  },
  lineCtaText: {
    marginBottom: 14,
  },
  lineCtaTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#15803d",
    marginBottom: 6,
  },
  lineCtaDesc: {
    fontSize: 13,
    color: "#166534",
    lineHeight: 1.6,
  },
  lineBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: "14px",
    background: "#06c755",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    boxSizing: "border-box",
    boxShadow: "0 4px 12px rgba(6,199,85,0.3)",
  },
  lineBtnIcon: {
    fontSize: 18,
  },
  startBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.05em",
  },
  note: {
    textAlign: "center",
    fontSize: 11,
    color: "#475569",
    marginTop: 12,
  },
  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  progressBar: {
    flex: 1,
    height: 8,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
    borderRadius: 999,
    transition: "width 0.3s",
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
  },
  catHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: 12,
    padding: "12px 16px",
    marginBottom: 20,
  },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 15, fontWeight: 700, color: "#0369a1" },
  catDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  qBox: {
    marginBottom: 20,
  },
  qNum: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 8,
    letterSpacing: "0.05em",
  },
  qText: {
    fontSize: 17,
    fontWeight: 600,
    lineHeight: 1.6,
    color: "#0f172a",
  },
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "13px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    color: "#334155",
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
  },
  optionSelected: {
    background: "#e0f2fe",
    border: "1px solid #38bdf8",
    color: "#0369a1",
    fontWeight: 600,
  },
  optionDot: {
    fontSize: 12,
    color: "#94a3b8",
    minWidth: 20,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    fontSize: 13,
    cursor: "pointer",
    padding: "4px 0",
  },
  scoreCircle: {
    textAlign: "center",
    padding: "8px 0",
  },
  scoreNum: {
    fontSize: 64,
    fontWeight: 800,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 18,
    color: "#94a3b8",
    marginLeft: 4,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    margin: "16px 0",
  },
  scoreItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "10px 12px",
  },
  scoreItemIcon: { fontSize: 18, marginBottom: 4 },
  scoreItemName: { fontSize: 11, color: "#64748b", marginBottom: 4 },
  scoreItemVal: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  scoreBar: {
    height: 5,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.5s",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 12,
  },
  typeCard: {
    border: "1px solid #fca5a5",
    background: "#fff5f5",
    borderRadius: 12,
    padding: "16px",
    marginBottom: 10,
  },
  typeName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#dc2626",
    marginBottom: 6,
  },
  typeDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.7,
    margin: "0 0 10px",
  },
  strategyList: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  strategyItem: {
    fontSize: 13,
    color: "#334155",
    paddingLeft: 4,
  },
  topPickCard: {
    background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
    border: "2px solid #0ea5e9",
    borderRadius: 14,
    padding: "20px",
    marginBottom: 16,
    boxShadow: "0 4px 16px rgba(14,165,233,0.15)",
  },
  topPickBadge: {
    display: "inline-block",
    background: "#0ea5e9",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 999,
    marginBottom: 12,
    letterSpacing: "0.06em",
  },
  topPickInner: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  topPickEmoji: { fontSize: 36, lineHeight: 1 },
  topPickLabel: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0369a1",
    marginBottom: 4,
  },
  topPickDesc: {
    fontSize: 13,
    color: "#0284c7",
    lineHeight: 1.6,
  },
  otherLabel: {
    fontSize: 11,
    color: "#94a3b8",
    letterSpacing: "0.08em",
    marginBottom: 8,
    paddingLeft: 2,
  },
  strategyCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    marginBottom: 8,
  },
  strategyCardActive: {
    background: "#e0f2fe",
    border: "1px solid #38bdf8",
  },
  strategyEmoji: { fontSize: 22, lineHeight: 1.2 },
  strategyLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 2,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  recommended: {
    fontSize: 11,
    color: "#0369a1",
    background: "#e0f2fe",
    padding: "2px 8px",
    borderRadius: 999,
  },
  strategyDesc: {
    fontSize: 12,
    color: "#64748b",
  },
};
