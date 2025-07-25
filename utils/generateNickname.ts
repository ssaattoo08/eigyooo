const cities = [
  { en: "Tokyo", ja: "トウキョウ" },
  { en: "New York", ja: "ニューヨーク" },
  { en: "London", ja: "ロンドン" },
  { en: "Paris", ja: "パリ" },
  { en: "Berlin", ja: "ベルリン" },
  { en: "Sydney", ja: "シドニー" },
  { en: "Moscow", ja: "モスクワ" },
  { en: "Beijing", ja: "ペキン" },
  { en: "Seoul", ja: "ソウル" },
  { en: "Bangkok", ja: "バンコク" },
  { en: "Singapore", ja: "シンガポール" },
  { en: "Hong Kong", ja: "ホンコン" },
  { en: "Dubai", ja: "ドバイ" },
  { en: "Istanbul", ja: "イスタンブール" },
  { en: "Rome", ja: "ローマ" },
  { en: "Madrid", ja: "マドリード" },
  { en: "Barcelona", ja: "バルセロナ" },
  { en: "Vienna", ja: "ウィーン" },
  { en: "Prague", ja: "プラハ" },
  { en: "Budapest", ja: "ブダペスト" },
  { en: "Amsterdam", ja: "アムステルダム" },
  { en: "Brussels", ja: "ブリュッセル" },
  { en: "Copenhagen", ja: "コペンハーゲン" },
  { en: "Stockholm", ja: "ストックホルム" },
  { en: "Oslo", ja: "オスロ" },
  { en: "Helsinki", ja: "ヘルシンキ" },
  { en: "Zurich", ja: "チューリッヒ" },
  { en: "Geneva", ja: "ジュネーブ" },
  { en: "Lisbon", ja: "リスボン" },
  { en: "Dublin", ja: "ダブリン" },
  { en: "Warsaw", ja: "ワルシャワ" },
  { en: "Krakow", ja: "クラクフ" },
  { en: "Munich", ja: "ミュンヘン" },
  { en: "Frankfurt", ja: "フランクフルト" },
  { en: "Hamburg", ja: "ハンブルク" },
  { en: "Milan", ja: "ミラノ" },
  { en: "Venice", ja: "ヴェネツィア" },
  { en: "Florence", ja: "フィレンツェ" },
  { en: "Athens", ja: "アテネ" },
  { en: "Edinburgh", ja: "エディンバラ" },
  { en: "Glasgow", ja: "グラスゴー" },
  { en: "Manchester", ja: "マンチェスター" },
  { en: "Birmingham", ja: "バーミンガム" },
  { en: "Toronto", ja: "トロント" },
  { en: "Vancouver", ja: "バンクーバー" },
  { en: "Montreal", ja: "モントリオール" },
  { en: "Los Angeles", ja: "ロサンゼルス" },
  { en: "San Francisco", ja: "サンフランシスコ" },
  { en: "Chicago", ja: "シカゴ" },
  { en: "Boston", ja: "ボストン" },
  { en: "Miami", ja: "マイアミ" },
  { en: "Washington", ja: "ワシントン" },
  { en: "Houston", ja: "ヒューストン" },
  { en: "Dallas", ja: "ダラス" },
  { en: "Seattle", ja: "シアトル" },
  { en: "San Diego", ja: "サンディエゴ" },
  { en: "Mexico City", ja: "メキシコシティ" },
  { en: "Buenos Aires", ja: "ブエノスアイレス" },
  { en: "Sao Paulo", ja: "サンパウロ" },
  { en: "Rio de Janeiro", ja: "リオデジャネイロ" },
  { en: "Cape Town", ja: "ケープタウン" },
  { en: "Johannesburg", ja: "ヨハネスブルグ" },
  { en: "Cairo", ja: "カイロ" },
  { en: "Casablanca", ja: "カサブランカ" },
  { en: "Marrakech", ja: "マラケシュ" },
  { en: "Ankara", ja: "アンカラ" },
  { en: "Tel Aviv", ja: "テルアビブ" },
  { en: "Jerusalem", ja: "エルサレム" },
  { en: "Doha", ja: "ドーハ" },
  { en: "Kuwait City", ja: "クウェートシティ" },
  { en: "Riyadh", ja: "リヤド" },
  { en: "Jeddah", ja: "ジッダ" },
  { en: "Abu Dhabi", ja: "アブダビ" },
  { en: "Muscat", ja: "マスカット" },
  { en: "Mumbai", ja: "ムンバイ" },
  { en: "Delhi", ja: "デリー" },
  { en: "Bangalore", ja: "バンガロール" },
  { en: "Chennai", ja: "チェンナイ" },
  { en: "Kolkata", ja: "コルカタ" },
  { en: "Jakarta", ja: "ジャカルタ" },
  { en: "Kuala Lumpur", ja: "クアラルンプール" },
  { en: "Manila", ja: "マニラ" },
  { en: "Hanoi", ja: "ハノイ" },
  { en: "Ho Chi Minh City", ja: "ホーチミン" },
  { en: "Taipei", ja: "タイペイ" },
  { en: "Auckland", ja: "オークランド" },
  { en: "Wellington", ja: "ウェリントン" },
  { en: "Melbourne", ja: "メルボルン" },
  { en: "Perth", ja: "パース" },
  { en: "Brisbane", ja: "ブリスベン" },
  { en: "Adelaide", ja: "アデレード" },
  { en: "Christchurch", ja: "クライストチャーチ" },
  { en: "Lima", ja: "リマ" },
  { en: "Santiago", ja: "サンティアゴ" },
  { en: "Bogota", ja: "ボゴタ" },
  { en: "Caracas", ja: "カラカス" },
  { en: "Quito", ja: "キト" },
  { en: "La Paz", ja: "ラパス" },
  { en: "Montevideo", ja: "モンテビデオ" }
];

export function generateNickname() {
  const index = Math.floor(Math.random() * cities.length);
  return cities[index];
} 