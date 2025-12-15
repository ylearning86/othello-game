# オセロゲーム - 技術ドキュメント

## 📋 プロジェクト概要

このプロジェクトは、React + TypeScript + Tailwind CSSで構築された完全機能のオセロ（リバーシ）ゲームです。プレイヤー対プレイヤー（PvP）とプレイヤー対AI（PvE）の両方のモードをサポートし、効果音とスムーズなアニメーションを備えています。

**実装された機能:**
- ✅ 8x8のゲームボード
- ✅ 完全なオセロのゲームルール実装
- ✅ リアルタイムの得点表示
- ✅ 有効な手のハイライト表示
- ✅ Web Audio APIを使用した効果音
- ✅ 3段階の難易度を持つAI対戦相手（Easy/Medium/Hard）
- ✅ フレーマーモーションによる滑らかなアニメーション
- ✅ ゲーム状態の永続化（ページリロード後も続行可能）

---

## 📁 ファイル構造と解説

### 🎯 コアゲームロジック

#### 1. `src/lib/othello.ts` - ゲームエンジン

**目的:** オセロゲームの全てのルールとゲーム状態管理を実装

**主要な型定義:**
```typescript
export type Player = 'black' | 'white';        // プレイヤーの色
export type Cell = Player | null;              // マス目の状態
export type Board = Cell[][];                  // 8x8のボード
export interface GameState {                   // ゲームの完全な状態
  board: Board;                                // ボードの現在の状態
  currentPlayer: Player;                       // 現在のターンのプレイヤー
  blackScore: number;                          // 黒の駒数
  whiteScore: number;                          // 白の駒数
  gameOver: boolean;                           // ゲーム終了フラグ
  winner: Player | 'tie' | null;              // 勝者
}
```

**主要な関数:**

- `createInitialBoard()`: 初期状態のボードを作成（中央に4つの駒を配置）
- `createInitialState()`: 初期ゲーム状態を返す
- `getFlippedPieces(board, row, col, player)`: 指定された位置に駒を置いた時にひっくり返る駒の座標リストを返す
  - 8方向（上下左右と斜め4方向）をチェック
  - 相手の駒が連続し、その先に自分の駒がある場合のみ有効
- `isValidMove(board, row, col, player)`: その位置に置けるかどうかを判定
- `getValidMoves(board, player)`: そのプレイヤーが置ける全ての有効な手を返す
- `makeMove(state, row, col)`: 駒を配置し、新しいゲーム状態を返す
  - 駒のひっくり返し処理
  - 次のプレイヤーの決定
  - 有効な手がない場合のパス処理
  - ゲーム終了判定
- `countPieces(board)`: 黒と白の駒数をカウント

**重要なロジック:**
- `DIRECTIONS`: 8方向の移動ベクトル `[[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]]`
- ゲーム終了条件: 両プレイヤーが置ける場所がなくなったとき

---

#### 2. `src/lib/ai.ts` - AI対戦相手の実装

**目的:** 3つの難易度レベルを持つAI対戦相手を実装

**難易度レベル:**

**Easy（簡単）:**
```typescript
function getEasyMove(validMoves: [number, number][]): [number, number]
```
- ランダムに有効な手から選択
- 戦略なし

**Medium（中級）:**
```typescript
function getMediumMove(board, validMoves, player): [number, number]
```
- **戦略1:** 角（コーナー）を優先的に狙う（角は絶対にひっくり返らない重要な位置）
- **戦略2:** 危険なマス（角の隣接マス）を避ける
- **戦略3:** できるだけ多くの駒をひっくり返す手を選ぶ

**Hard（難しい）:**
```typescript
function getHardMove(board, validMoves, player): [number, number]
```
- **Minimaxアルゴリズム**を使用（深さ4の先読み）
- Alpha-Beta枝刈りで最適化
- 位置評価関数を使用:
  - 角: +100点（最重要）
  - 辺: +10点
  - 危険マス（角の隣）: -20点
  - 通常マス: +1点
  - 移動可能性も評価（相手の手を制限）

**重要な定数:**
```typescript
const CORNER_POSITIONS = [[0,0], [0,7], [7,0], [7,7]];  // 角
const EDGE_POSITIONS = [...];                             // 辺
const DANGER_POSITIONS = [[0,1], [1,0], [1,1], ...];    // 角の隣接マス
```

**Minimaxアルゴリズムの動作:**
1. 現在の局面から可能な全ての手を評価
2. 相手も最善手を打つと仮定して、数手先まで読む
3. 最終的に最も有利な局面になる手を選択

---

#### 3. `src/lib/sounds.ts` - 効果音システム

**目的:** Web Audio APIを使用してゲーム内効果音を生成

**AudioManagerクラス:**

```typescript
class AudioManager {
  private audioContext: AudioContext | null = null;
  
  // 基本音を再生
  private playTone(frequency, duration, type, volume)
  
  // 和音を再生
  private playChord(frequencies, duration, type, volume)
  
  // 公開メソッド（ゲーム内で使用）
  placePiece()      // 駒を置いた時の音（440Hz、0.1秒）
  flipPieces(count) // 駒がひっくり返る音（カウントに応じて連続再生）
  gameOver(isWin)   // ゲーム終了の音（勝ち: 上昇メロディ、引き分け: 和音）
  newGame()         // 新しいゲーム開始の音（和音）
  invalidMove()     // 無効な手を打とうとした時の音（低音、短い）
}
```

**効果音の詳細:**

1. **駒の配置音 (`placePiece`)**
   - 440Hz（A4音）のサイン波、0.1秒
   - 駒を置いた瞬間の「カチッ」という感覚

2. **駒のひっくり返り音 (`flipPieces`)**
   - ベース周波数: 523.25Hz（C5音）
   - ひっくり返る駒の数だけ連続再生（最大8個）
   - 各音は30ms間隔で徐々に高くなる（+50Hzずつ）
   - 三角波を使用して柔らかい音色

3. **ゲーム終了音 (`gameOver`)**
   - 勝利: C5→E5→G5→C6（ドミソドの上昇）
   - 引き分け: C4+E4+G4の和音（0.6秒持続）

4. **新ゲーム音 (`newGame`)**
   - G4+B4+D5の和音（0.2秒）

5. **無効な手の音 (`invalidMove`)**
   - 200Hzの矩形波（0.1秒）- 「ブッ」という警告音

**技術的なポイント:**
- AudioContextを遅延初期化（ユーザー操作後に作成）
- Oscillator（発振器）を使って純粋な音波を生成
- GainNodeで音量をコントロールし、フェードアウト効果を実現

---

### 🎨 UIコンポーネント

#### 4. `src/components/BoardCell.tsx` - ボードのマス目

**目的:** ゲームボードの1つのマスを表示

**Props:**
```typescript
interface BoardCellProps {
  cell: Cell;           // このマスの状態（black/white/null）
  isValid: boolean;     // 現在のプレイヤーが置ける場所か
  onClick: () => void;  // クリック時の処理
  isNew: boolean;       // 直前に置かれた駒か
}
```

**機能:**
1. **インタラクティブなボタン**
   - Framer Motionで hover/tap アニメーション
   - 有効な手の場合: ホバーで1.05倍、タップで0.95倍
   
2. **有効な手のインジケーター**
   - 黄金色（accent color）の円形が表示
   - パルスアニメーション: スケール [1, 1.2, 1] を1.5秒で繰り返し
   - 光る効果（box-shadow）で視認性向上

3. **視覚的なフィードバック**
   - 背景色: 深い緑（ゲームボードの質感）
   - インセットシャドウで立体的な窪み表現
   - ボーダーで各マスを区切り

**スタイリング:**
```typescript
backgroundColor: 'oklch(0.45 0.08 155)'  // 深い緑
border: '1px solid oklch(0.95 0.02 85)'  // クリームホワイト
boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'  // 内側の影
```

---

#### 5. `src/components/GamePiece.tsx` - ゲームの駒

**目的:** 黒または白の駒を3Dフリップアニメーションで表示

**Props:**
```typescript
interface GamePieceProps {
  player: Player;    // 'black' または 'white'
  isNew?: boolean;   // 新しく置かれた駒か（初期スケールアニメーション用）
}
```

**3Dフリップアニメーション:**
```typescript
<motion.div
  initial={isNew ? { scale: 0, rotateY: 0 } : { rotateY: 0 }}
  animate={{ scale: 1, rotateY: player === 'black' ? 0 : 180 }}
  transition={{ duration: 0.4, ease: 'easeInOut' }}
  style={{ transformStyle: 'preserve-3d' }}
>
```

**仕組み:**
1. 2つのdiv要素（黒面と白面）が重なっている
2. `backfaceVisibility: 'hidden'` で裏面を非表示
3. 白面は `rotateY(180deg)` で180度回転して配置
4. `player` プロパティに応じて全体を回転
   - `black`: 0度（黒面が見える）
   - `white`: 180度（白面が見える）
5. 新しい駒は `scale: 0` から始まって拡大

**視覚効果:**
- **黒面**: 放射状グラデーション（濃い黒から真っ黒）
- **白面**: 放射状グラデーション（明るい白からやや暗い白）
- 両面に微妙な影とハイライトで立体感
- `boxShadow` で駒の丸みと深さを表現

---

#### 6. `src/App.tsx` - メインアプリケーション

**目的:** ゲーム全体の統合とUI構成

**主要なステート管理:**

```typescript
// 永続化されるステート（useKV - ページリロード後も保持）
const [gameState, setGameState] = useKV<GameState>('othello-game', createInitialState());
const [gameMode, setGameMode] = useKV<GameMode>('othello-mode', 'pvp');
const [difficulty, setDifficulty] = useKV<Difficulty>('othello-difficulty', 'medium');

// 一時的なステート（useState - リロードでリセット）
const [validMoves, setValidMoves] = useState<[number, number][]>([]);
const [lastMove, setLastMove] = useState<[number, number] | null>(null);
const [isAIThinking, setIsAIThinking] = useState(false);
```

**重要な関数:**

**1. handleMove - 駒を配置する**
```typescript
const handleMove = (row: number, col: number) => {
  // 1. ひっくり返る駒の数を取得
  const flippedCount = getFlippedPieces(...).length;
  
  // 2. 効果音を再生
  audioManager.placePiece();
  if (flippedCount > 0) {
    setTimeout(() => audioManager.flipPieces(flippedCount), 100);
  }
  
  // 3. ゲーム状態を更新
  setLastMove([row, col]);
  const newState = makeMove(currentState, row, col);
  setGameState(newState);
  
  // 4. ゲーム終了チェック
  if (newState.gameOver) {
    setTimeout(() => {
      audioManager.gameOver(newState.winner !== 'tie');
    }, 300 + (flippedCount * 30));
  }
};
```

**2. AIターンの処理（useEffect）**
```typescript
useEffect(() => {
  if (isAITurn && !isAIThinking) {
    setIsAIThinking(true);
    
    // 難易度に応じた思考時間
    const thinkingTime = difficulty === 'easy' ? 300 : 
                         difficulty === 'medium' ? 600 : 900;
    
    setTimeout(() => {
      const aiMove = getAIMove(currentState, difficulty);
      if (aiMove) {
        handleMove(aiMove[0], aiMove[1]);
      }
      setIsAIThinking(false);
    }, thinkingTime);
  }
}, [isAITurn, isAIThinking, currentState, difficulty]);
```

**UI構成:**

1. **ヘッダー**
   - ゲームタイトル「Othello」
   - フェードインアニメーション

2. **ゲームボード（左側）**
   - 8x8グリッド、各マスに `BoardCell` コンポーネント
   - AI思考中は透明度を下げて無効化
   - AI思考インジケーター（ロボットアイコン + テキスト）

3. **サイドパネル（右側）**
   - **ゲームモード選択**
     - PvP（プレイヤー vs プレイヤー）
     - PvE（プレイヤー vs AI）
   - **難易度選択**（PvEモードのみ表示）
     - Easy / Medium / Hard
   - **現在のターン表示**
     - 黒または白のバッジ
     - AIターンの場合は「(AI)」表示
   - **スコア表示**
     - 黒と白の駒数
     - 数値変化時のアニメーション
   - **ゲーム終了メッセージ**
     - 勝者の表示またはドロー
     - アニメーション付きで表示
   - **新しいゲームボタン**
     - ゲームリセット機能

**レスポンシブデザイン:**
```typescript
<div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
```
- デスクトップ: ボードとサイドパネルが横並び
- モバイル: 縦積み配置

---

### 🎨 スタイリング

#### 7. `src/index.css` - テーマ定義

**カラーパレット:**

```css
:root {
  /* 背景と前景 */
  --background: oklch(0.35 0.08 155);     /* 深い森の緑 */
  --foreground: oklch(0.98 0 0);          /* ほぼ白 */

  /* カードとポップオーバー */
  --card: oklch(0.40 0.08 155);           /* やや明るい緑 */
  --card-foreground: oklch(0.98 0 0);

  /* アクション色 */
  --primary: oklch(0.65 0.15 75);         /* 琥珀色のゴールド */
  --primary-foreground: oklch(0.2 0 0);   /* 暗い文字 */
  
  /* ミュート色 */
  --muted: oklch(0.45 0.08 155);
  --muted-foreground: oklch(0.85 0.02 155);
  
  /* アクセント色 */
  --accent: oklch(0.65 0.15 75);          /* ゴールド */
  
  /* UI要素 */
  --border: oklch(0.95 0.02 85);          /* クリームホワイト */
  --input: oklch(0.5 0.08 155);
  --ring: oklch(0.65 0.15 75);            /* フォーカスリング */
  
  /* 角丸 */
  --radius: 0.5rem;
}
```

**デザインの意図:**
- **深い緑**: 伝統的なゲームボードの雰囲気（ビリヤード台のフェルトのような）
- **琥珀色**: 高級感と視認性を両立
- **OKLCH色空間**: 知覚的に均一な色表現、高いコントラスト比を実現

**フォント:**
```css
body {
  font-family: 'Space Grotesk', sans-serif;
}
```
- Space Grotesk: モダンで幾何学的、ゲーム性に合った明確な書体

---

#### 8. `index.html` - HTMLエントリーポイント

**内容:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Othello Game</title>
    
    <!-- Google Fonts: Space Grotesk -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
    
    <!-- Viteが処理するCSS -->
    <link href="/src/main.css" rel="stylesheet" />
</head>
<body>
    <div id="root"></div>
    <!-- Viteが処理するTypeScript -->
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

---

### 📄 ドキュメント

#### 9. `PRD.md` - プロダクト要件定義書

このドキュメントには以下が含まれています:

1. **プロジェクトの使命** - オセロゲームの目的
2. **体験の質** - 戦略的、明確、満足感のある
3. **必須機能** - 各機能の詳細な仕様
4. **エッジケース処理** - 特殊状況への対応
5. **デザイン方向性** - 視覚的なコンセプト
6. **色の選択** - カラーパレットの根拠
7. **フォント選択** - タイポグラフィの階層
8. **アニメーション** - 動きの原則
9. **コンポーネント選択** - 使用するUI部品

---

## 🔧 技術スタック

### フレームワークとライブラリ

1. **React 19** - UIフレームワーク
2. **TypeScript** - 型安全性
3. **Vite** - 高速なビルドツール
4. **Tailwind CSS v4** - ユーティリティファーストCSS
5. **Framer Motion** - アニメーションライブラリ
6. **shadcn/ui v4** - UIコンポーネントライブラリ
7. **Phosphor Icons** - アイコンセット

### 主要な技術

**状態管理:**
- `useKV` フック: Spark SDKの永続化API（ゲーム状態、モード、難易度）
- `useState`: 一時的なUI状態（有効な手、最後の手、AI思考中フラグ）

**効果音:**
- Web Audio API: ブラウザネイティブの音声生成
- OscillatorNode: 純粋な波形生成
- GainNode: 音量制御とフェード効果

**アニメーション:**
- Framer Motion: 宣言的なアニメーション
- CSS Transform: 3D回転とスケーリング
- Transition: イージング関数とタイミング

**アルゴリズム:**
- Minimax: ゲーム木探索
- Alpha-Beta枝刈り: 探索の最適化
- 位置評価関数: 盤面の良し悪しを数値化

---

## 🎮 ゲームフロー

### 1. ゲーム開始
```
アプリ起動 
  → 永続化されたゲーム状態をロード（または新規作成）
  → 初期ボード表示（中央に4つの駒）
  → 黒プレイヤーのターン
  → 有効な手を計算して表示
```

### 2. プレイヤーのターン（PvPモード）
```
プレイヤーがマスをクリック
  → 有効な手かチェック
  → 有効: 駒を配置 + 効果音
  → ひっくり返す駒を計算
  → アニメーションで駒をフリップ + 効果音
  → スコア更新
  → 次のプレイヤーにターン変更
  → 有効な手を再計算
  → ゲーム終了チェック
```

### 3. AIのターン（PvEモード）
```
白（AI）のターン開始
  → isAIThinking = true
  → UIを無効化（透明度を下げる）
  → 「AI is thinking...」表示
  → 難易度に応じた思考時間待機
  → AIアルゴリズムで最善手を計算
  → 自動的に駒を配置
  → isAIThinking = false
  → プレイヤーのターンに戻る
```

### 4. ゲーム終了
```
両プレイヤーが置ける場所なし
  → gameOver = true
  → 駒数を比較して勝者決定
  → 勝利メッセージ表示
  → 勝利の音楽再生
  → 「New Game」ボタンでリセット可能
```

---

## 🧮 オセロのルール実装

### 有効な手の判定

**条件:**
1. そのマスが空である
2. 少なくとも1方向で相手の駒をひっくり返せる

**ひっくり返し判定（8方向チェック）:**
```
現在のマス位置から8方向それぞれに:
  1. 隣のマスが相手の駒か？
     → No: この方向は無効
     → Yes: 次へ
  
  2. その方向に相手の駒が続く限り進む
  
  3. 相手の駒の連続が終わったら:
     - 自分の駒がある → この方向は有効（間の相手駒を全てひっくり返せる）
     - 空マスまたは境界 → この方向は無効

少なくとも1方向が有効なら、その手は有効
```

### パス処理

```
現在のプレイヤーが置ける場所がない場合:
  → 自動的に相手にターンを渡す
  
相手も置ける場所がない場合:
  → ゲーム終了
```

---

## 🤖 AI実装の詳細

### Easy AI
- **戦略**: ランダム選択
- **思考時間**: 300ms
- **対象プレイヤー**: 初心者

### Medium AI
- **戦略**: 
  1. 角があれば最優先
  2. 危険マスを避ける
  3. 最多フリップ数を狙う
- **思考時間**: 600ms
- **対象プレイヤー**: 中級者

### Hard AI
- **戦略**: Minimaxアルゴリズム（深さ4）
- **評価関数**:
  ```
  スコア = 位置価値の合計 + (自分の手数 - 相手の手数) × 5
  
  位置価値:
    角 = ±100
    辺 = ±10
    危険マス = ∓20
    通常マス = ±1
  ```
- **最適化**: Alpha-Beta枝刈り
- **思考時間**: 900ms
- **対象プレイヤー**: 上級者

**Minimaxの動作例:**
```
現在の局面（深さ0）
  ├─ 手A（深さ1）
  │   ├─ 相手の手A-1（深さ2）
  │   │   ├─ 手A-1-a（深さ3）
  │   │   └─ 手A-1-b（深さ3）
  │   └─ 相手の手A-2（深さ2）
  ├─ 手B（深さ1）
  └─ 手C（深さ1）

各末端ノード（深さ4）で盤面を評価
→ 最小化・最大化を交互に適用
→ 最終的に最高評価の手を選択
```

---

## 🔊 効果音の実装原理

### Web Audio APIの基本フロー
```
AudioContext作成
  → OscillatorNode作成（音波生成器）
  → GainNode作成（音量コントローラー）
  → ノードを接続: Oscillator → Gain → Destination（スピーカー）
  → 周波数とタイプを設定
  → 音量のエンベロープを設定
  → 再生開始
  → 指定時間後に停止
```

### 音の種類

**1. サイン波（sine）**: 純粋な音、柔らかい
- 使用箇所: 駒の配置、ゲーム終了メロディ

**2. 三角波（triangle）**: やや明るい音
- 使用箇所: 駒のひっくり返り

**3. 矩形波（square）**: 硬い、電子音的
- 使用箇所: 無効な手の警告

### カスケードサウンドの実装
```typescript
flipPieces(count: number) {
  for (let i = 0; i < Math.min(count, 8); i++) {
    setTimeout(() => {
      // 523.25Hz（C5）から始まり、+50Hzずつ上昇
      this.playTone(523.25 + (i * 50), 0.08, 'triangle', 0.15);
    }, i * 30);  // 30ms間隔で再生
  }
}
```

結果: 「ピロピロピロ」という連続した音

---

## 💾 データ永続化

### useKV フック
```typescript
const [gameState, setGameState] = useKV('othello-game', initialState);
```

**動作:**
- ブラウザのIndexedDBまたは類似のストレージに保存
- ページリロード後も状態が保持される
- キーごとに独立して管理

**保存されるデータ:**
- `othello-game`: ゲーム状態（ボード、スコア、ターン等）
- `othello-mode`: ゲームモード（pvp/pve）
- `othello-difficulty`: AI難易度（easy/medium/hard）

**更新時の注意（重要）:**
```typescript
// ❌ 間違い - stale closureの問題
setGameState([...gameState, newItem]);

// ✅ 正しい - 関数型更新
setGameState((currentState) => [...currentState, newItem]);
```

---

## 📱 レスポンシブ対応

### ブレークポイント
- モバイル: `< 768px`
- デスクトップ: `≥ 768px`

### レイアウト調整
```typescript
// デスクトップ: 横並び
<div className="grid md:grid-cols-[1fr_auto] gap-6">

// ボードサイズ
className="max-w-[500px]"  // 最大幅を制限

// アスペクト比を維持
style={{ aspectRatio: '1/1' }}
```

### タッチ対応
- ボタンのタップフィードバック（`whileTap={{ scale: 0.95 }}`）
- 十分なタッチターゲットサイズ（各マスが均等に配分）

---

## 🚀 パフォーマンス最適化

1. **メモ化された計算**
   - `validMoves`は`gameState`が変わった時のみ再計算

2. **効率的な状態更新**
   - イミュータブルな更新パターン
   - 必要最小限の再レンダリング

3. **アニメーションの最適化**
   - Framer Motionによるハードウェアアクセラレーション
   - `transform`プロパティの使用（repaintを避ける）

4. **音声の最適化**
   - AudioContextの遅延初期化
   - 同時再生数の制限（最大8音）

---

## 🎯 コードの設計パターン

### 関心の分離
- **ゲームロジック** (`othello.ts`): ビューから独立
- **AI** (`ai.ts`): ゲームロジックを使用するが独立
- **効果音** (`sounds.ts`): 再利用可能なマネージャークラス
- **UI** (`App.tsx`, components): プレゼンテーション層

### 型安全性
```typescript
// 厳密な型定義
type Player = 'black' | 'white';  // string ではなく
type Cell = Player | null;        // any ではなく

// インターフェースで契約を明確化
interface GameState { ... }
interface BoardCellProps { ... }
```

### 純粋関数
```typescript
// 副作用なし、テスト可能
export function getFlippedPieces(
  board: Board, 
  row: number, 
  col: number, 
  player: Player
): [number, number][] {
  // 元のboardを変更しない
  // 同じ入力 → 同じ出力
}
```

---

## 🧪 テストのポイント（実装なし、指針のみ）

もしテストを書く場合:

### ユニットテスト
```typescript
// othello.ts
test('getFlippedPieces: 上下左右の判定', () => { ... });
test('makeMove: スコアが正しく更新される', () => { ... });
test('getValidMoves: 有効な手が全て返される', () => { ... });

// ai.ts
test('easyAI: ランダムだが有効な手を返す', () => { ... });
test('hardAI: 角を優先する', () => { ... });
```

### インテグレーションテスト
```typescript
test('駒を置くと効果音が鳴る', () => { ... });
test('AIのターンが自動的に進行する', () => { ... });
test('ゲーム状態が永続化される', () => { ... });
```

---

## 🎨 UIデザインの原則

### カラー戦略
- **高コントラスト**: アクセシビリティ（WCAG AA準拠）
- **意味のある色**: 黒/白の駒、ゴールドのアクセント
- **一貫性**: 全体で統一されたパレット

### アニメーション原則
- **目的を持つ**: 状態変化を視覚化
- **自然な動き**: イージング関数で物理的な感覚
- **適度な速度**: 0.4秒のフリップ、1.5秒のパルス

### レイアウト
- **明確な階層**: ゲームボードが主役
- **適切な余白**: 詰まり過ぎない、広すぎない
- **視線の流れ**: 左から右、上から下

---

## 🔮 今後の拡張アイデア

1. **オンライン対戦**
   - WebSocketでリアルタイム対戦
   - マッチメイキングシステム

2. **リプレイ機能**
   - 手の履歴を保存
   - 巻き戻し/早送り

3. **統計とランキング**
   - 勝率の記録
   - AI難易度別の成績

4. **カスタマイズ**
   - テーマ切り替え（色、駒のデザイン）
   - 効果音のオン/オフ

5. **チュートリアル**
   - インタラクティブなルール説明
   - ヒント機能

6. **より強力なAI**
   - 深さ6-8のMinimax
   - 機械学習モデルの統合

---

## 📚 参考資料

### オセロのルール
- 有効な手の判定
- パスとゲーム終了条件
- 戦略的な位置（角、辺、危険マス）

### アルゴリズム
- **Minimax**: ゲーム木探索の基本
- **Alpha-Beta枝刈り**: 探索の高速化
- **評価関数**: 盤面の良し悪しを数値化

### Web技術
- **Web Audio API**: ブラウザでの音声生成
- **Framer Motion**: React用アニメーションライブラリ
- **OKLCH色空間**: 知覚的に均一な色表現

---

## 🎓 学習のポイント

このプロジェクトから学べること:

1. **ゲームロジックの実装**
   - ルールベースのシステム設計
   - 状態管理とイミュータビリティ

2. **アルゴリズム**
   - 再帰的な探索（Minimax）
   - 最適化手法（Alpha-Beta）

3. **UI/UXデザイン**
   - アニメーションで直感的なフィードバック
   - レスポンシブデザイン

4. **音響設計**
   - Web Audio APIの基礎
   - 音色と周波数の選択

5. **TypeScript**
   - 厳密な型定義
   - 型安全なコード

6. **React パターン**
   - カスタムフック（useKV）
   - コンポーネント分割
   - 副作用管理（useEffect）

---

## 🔧 開発とデバッグ

### 開発サーバーの起動
```bash
npm run dev
```

### よくある問題と解決法

**1. 駒がひっくり返らない**
→ `getFlippedPieces` の8方向チェックを確認

**2. 効果音が鳴らない**
→ AudioContextはユーザー操作後に初期化される（ブラウザの制限）

**3. AIが動かない**
→ `isAITurn` の条件とuseEffectの依存配列を確認

**4. ゲーム状態がリセットされる**
→ `useKV` を使っているか確認（`useState` は永続化されない）

### デバッグのヒント
```typescript
// ゲーム状態をコンソールに出力
console.log('Current State:', gameState);
console.log('Valid Moves:', validMoves);
console.log('AI Thinking:', isAIThinking);
```

---

## ✨ まとめ

このオセロゲームは以下の技術を統合した完全な Web アプリケーションです:

- ✅ **完全なゲーム実装**: ルール、パス、終了判定
- ✅ **3段階のAI**: Easy/Medium/Hard
- ✅ **効果音システム**: Web Audio API
- ✅ **スムーズなアニメーション**: Framer Motion + 3D transforms
- ✅ **永続化**: ページリロード後も続行可能
- ✅ **レスポンシブ**: モバイルとデスクトップ対応
- ✅ **型安全**: TypeScriptで堅牢性確保

コードは保守性と拡張性を考慮して設計されており、新機能の追加やカスタマイズが容易です。
