export interface WallDetail {
  id: string;
  title: string;
  description: string;
  impact: string;
  action: string;
  merits: string[];
  demerits: string[];
}

export const WALL_DETAILS: Record<string, WallDetail> = {
  SOCIAL_106: {
    id: "SOCIAL_106",
    title: "社会保険 106 万円",
    description: "従業員 51 人以上の企業で週 20 時間以上勤務すると、106 万円で社会保険加入が必要になります。",
    impact: "厚生年金・健康保険料が控除されるため手取りが減少しますが、保障が安定します。",
    action: "加入後の保険料と将来の年金見込みを再確認し、勤務時間の調整や昇給額とのバランスを検討しましょう。",
    merits: ["医療・年金の保障が充実する", "産休・育休などの制度を利用しやすくなる"],
    demerits: ["社会保険料の負担が発生し手取りが減る", "扶養から外れる場合は家計管理を見直す必要がある"]
  },
  RESIDENT_110: {
    id: "RESIDENT_110",
    title: "住民税 110 万円",
    description: "年間所得が 110 万円を超えると住民税（均等割・所得割）が課税されます。",
    impact: "翌年の住民税が天引きされ、可処分所得が減少します。",
    action: "自治体の非課税枠を調べ、控除証明書の提出やふるさと納税の活用を検討しましょう。",
    merits: ["課税所得が発生し、社会保険加入の可能性が広がる"],
    demerits: ["住民税が翌年にまとめて請求される可能性がある"]
  },
  TAX_FUYOU_123: {
    id: "TAX_FUYOU_123",
    title: "扶養控除（住民税）123 万円",
    description: "住民税の配偶者控除を維持するには年間所得 123 万円以下に抑える必要があります。",
    impact: "控除が外れると世帯全体の税負担が増える場合があります。",
    action: "年末時点の見込みを確認し、賞与や交通費の扱いを早めに調整しましょう。",
    merits: ["働き方の自由度が上がり将来の昇給に繋がる"],
    demerits: ["扶養控除の適用外となり世帯課税が増加"]
  },
  SOCIAL_130: {
    id: "SOCIAL_130",
    title: "社会保険 130 万円",
    description: "一般的な扶養範囲を超えると被扶養者から外れ、自分で社会保険料を負担します。",
    impact: "国民年金・国民健康保険料の支払いが発生し、年間の手取りが大きく変動します。",
    action: "収支シミュレーションを行い、月収と就業時間を調整して負担増に備えましょう。",
    merits: ["社会保障の加入実績が増え将来の年金額が上がる"],
    demerits: ["保険料負担が重くなる", "扶養控除の適用が外れる"]
  },
  SPOUSE_150: {
    id: "SPOUSE_150",
    title: "配偶者控除 150 万円",
    description: "配偶者控除の満額適用は 150 万円まで。これを超えると段階的に控除額が減ります。",
    impact: "世帯の所得税・住民税が増えるため、配偶者の収入増加分と効果を比較する必要があります。",
    action: "控除縮小を前提に家計を試算し、必要に応じて iDeCo や保険料控除を活用しましょう。",
    merits: ["昇給・賞与を取り込みやすくなる"],
    demerits: ["控除減少により世帯課税が増える"]
  },
  TAX_160: {
    id: "TAX_160",
    title: "所得税（概算）160 万円",
    description: "課税所得が増え、源泉所得税が発生します。源泉徴収票を確認し確定申告が必要な場合があります。",
    impact: "所得税 5%（概算）が控除されるため、手取りが減少します。",
    action: "年末調整の控除証明書を整理し、医療費控除などの適用可否を確認しましょう。",
    merits: ["社会保険・税金を納めることで信用情報が蓄積する"],
    demerits: ["確定申告の手間が増える"]
  },
  STUDENT_188: {
    id: "STUDENT_188",
    title: "学生特例控除 188 万円",
    description: "特定扶養控除の上限。超えると親の税額が増える可能性があります。",
    impact: "扶養から外れることで学費や家計への負担が増える場合があります。",
    action: "月次のシフト管理を行い、交通費や賞与の扱いを含めて家族と共有しましょう。",
    merits: ["高収入のアルバイト経験でキャリア形成に繋がる"],
    demerits: ["親の税負担が増える可能性がある"]
  },
  SPOUSE_2016: {
    id: "SPOUSE_2016",
    title: "配偶者特別控除終了 201.6 万円",
    description: "201.6 万円を超えると配偶者特別控除がゼロになります。",
    impact: "世帯税額が最も増えやすいゾーンのため注意が必要です。",
    action: "就業調整か、共働き前提の家計設計へ転換するかを検討しましょう。",
    merits: ["フルタイム化による社会保障・昇給の期待"],
    demerits: ["控除がなくなるため世帯課税が大きく増える"]
  }
};

export function getWallMerits(ids: string[]) {
  return ids.flatMap((id) => WALL_DETAILS[id]?.merits ?? []);
}

export function getWallDemerits(ids: string[]) {
  return ids.flatMap((id) => WALL_DETAILS[id]?.demerits ?? []);
}
