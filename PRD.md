# Planning Guide

A strategic Othello (Reversi) game where two players compete to control the board by placing pieces and flipping opponent pieces between their own.

**Experience Qualities**: 
1. **Strategic** - Every move requires careful consideration of positioning and future opportunities
2. **Clear** - Game state, valid moves, and score are immediately visible and understandable
3. **Satisfying** - Piece flipping animations create rewarding feedback for successful captures

**Complexity Level**: Light Application (multiple features with basic state)
- This is a complete board game with move validation, piece flipping logic, turn management, score tracking, and AI opponent with multiple difficulty levels

## Essential Features

### Board Display
- **Functionality**: 8x8 grid displaying black and white pieces with starting position (4 pieces in center)
- **Purpose**: Provides the playing field and visual representation of game state
- **Trigger**: Automatically rendered on game load
- **Progression**: Initial render → Update on each move → Show valid moves on hover → Animate piece flips
- **Success criteria**: Board displays correctly, pieces are clearly distinguishable, grid is visually balanced

### Move Validation & Placement
- **Functionality**: Highlights valid moves for current player and places pieces only in legal positions
- **Purpose**: Enforces game rules and guides players toward valid actions
- **Trigger**: Hover over empty squares or click to place piece
- **Progression**: Player hovers square → System checks if move is valid → Highlights valid squares → Player clicks → Piece placed → Opponent pieces flipped
- **Success criteria**: Only legal moves are allowed, invalid clicks are ignored, all flipping directions are calculated correctly

### Piece Flipping Animation
- **Functionality**: Animates the color transition of captured pieces
- **Purpose**: Creates satisfying visual feedback and clearly shows the impact of each move
- **Trigger**: After a valid piece placement
- **Progression**: Piece placed → Identify all pieces to flip → Animate color transition → Update board state → Switch turn
- **Success criteria**: Smooth animation, all affected pieces flip, timing feels natural

### Turn Management & Score Display
- **Functionality**: Tracks current player, displays score for both sides, indicates when game is over
- **Purpose**: Keeps players informed of game progress and determines winner
- **Trigger**: Automatically updates after each move
- **Progression**: Display current turn → Show live score → Detect when no valid moves remain → Display winner → Offer restart
- **Success criteria**: Score accurately reflects board state, turn indicator is clear, game end is properly detected

### Game Reset
- **Functionality**: Restarts game to initial state
- **Purpose**: Allows players to start fresh match without page reload
- **Trigger**: Click reset button
- **Progression**: Button click → Reset board to starting position → Reset scores → Set black as starting player
- **Success criteria**: Complete state reset, smooth transition to new game

### Sound Effects
- **Functionality**: Audio feedback for game actions using Web Audio API
- **Purpose**: Enhances engagement and provides satisfying auditory confirmation of player actions
- **Trigger**: Various game events (piece placement, flipping, game end, reset)
- **Progression**: Player action → Synthesize appropriate tone → Play sound at correct timing → Multiple sounds sequence for cascading effects
- **Success criteria**: Sounds are clear and pleasant, timing matches visual feedback, volume is balanced, sounds enhance rather than distract

### Game Mode Selection
- **Functionality**: Toggle between Player vs Player (PvP) and Player vs AI (PvE) modes
- **Purpose**: Allows solo play against computer opponent or local multiplayer
- **Trigger**: Click mode selection buttons before or during game
- **Progression**: Select mode → Game resets → Play with chosen mode → Switch modes anytime via button
- **Success criteria**: Mode persists between sessions, switching modes starts fresh game, clear visual indication of current mode

### AI Opponent
- **Functionality**: Computer player that analyzes board and makes strategic moves
- **Purpose**: Enables single-player experience with varying challenge levels
- **Trigger**: Automatically on AI's turn (white player in PvE mode)
- **Progression**: Player makes move → AI analyzes valid moves → Applies difficulty algorithm → Displays thinking indicator → Makes move after delay → Player's turn
- **Success criteria**: AI makes legal moves, difficulty affects strategy quality, thinking delay feels natural, AI doesn't block user interaction

## Edge Case Handling
- **No Valid Moves**: If current player has no valid moves, automatically pass turn to opponent
- **Game End**: When neither player can move, declare winner based on piece count (or tie)
- **Corner Cases**: Properly handle edge and corner squares where pieces can only be flipped in certain directions
- **Multiple Directions**: Correctly flip pieces in all valid directions from a single placement
- **AI Turn Interruption**: Disable board interaction during AI thinking phase
- **Mode Switching**: Reset game state when switching between PvP and PvE modes

## Design Direction
The design should evoke the classic elegance of a traditional board game while feeling modern and digital - a balance of timeless strategy game aesthetics with smooth, responsive interactions.

## Color Selection
A rich, classic game aesthetic with deep contrast and warm accents.

- **Primary Color**: Deep Forest Green (oklch(0.35 0.08 155)) - Evokes traditional game board felt, provides sophisticated backdrop
- **Secondary Colors**: Warm Cream (oklch(0.95 0.02 85)) for board grid lines and borders - Creates classic board game contrast
- **Accent Color**: Amber Gold (oklch(0.65 0.15 75)) for highlights and valid move indicators - Draws attention without being jarring
- **Foreground/Background Pairings**: 
  - Background Deep Green (oklch(0.35 0.08 155)): White text (oklch(0.98 0 0)) - Ratio 8.2:1 ✓
  - Accent Gold (oklch(0.65 0.15 75)): Dark text (oklch(0.2 0 0)) - Ratio 7.5:1 ✓
  - Light squares (oklch(0.45 0.08 155)): White text (oklch(0.98 0 0)) - Ratio 5.8:1 ✓

## Font Selection
The typeface should convey clarity and modernity while nodding to classic game typography.

- **Typographic Hierarchy**: 
  - H1 (Game Title): Space Grotesk Bold/32px/tight letter spacing
  - H2 (Score & Turn): Space Grotesk Medium/20px/normal spacing
  - Body (Instructions): Space Grotesk Regular/16px/relaxed spacing

## Animations
Animations should emphasize the satisfying nature of capturing pieces and reinforce cause-and-effect relationships. Sound effects complement visual feedback. AI thinking states have subtle visual indicators.

- Piece flip transitions using 3D rotation effect (rotateY) over 400ms with ease-in-out
- Valid move indicators pulse gently to draw attention without distraction
- Piece placement has subtle scale-up effect to emphasize commitment
- Score changes animate with number increments for impact
- AI thinking indicator with pulsing robot icon
- Board opacity dims slightly during AI turn to indicate wait state
- Sound effects: piece placement (single tone), cascading flip sounds (sequential tones), victory melody (chord progression), new game chord

## Component Selection
- **Components**: 
  - Button (shadcn) for game reset and mode selection with hover state customization
  - Card (shadcn) for game container with elevated appearance
  - Badge (shadcn) for displaying current turn and scores
  - Select (shadcn) for AI difficulty dropdown
- **Customizations**: 
  - Custom board grid using CSS Grid (8x8)
  - Custom piece components with 3D flip animation using framer-motion
  - Custom cell hover states with subtle glow effect
  - Mode toggle buttons with active state styling
- **States**: 
  - Board cells: empty, black piece, white piece, valid move indicator, disabled (AI turn)
  - Pieces: static, flipping animation, just-placed
  - Game: in-progress, game-over, ai-thinking
  - Mode buttons: active, inactive
- **Icon Selection**: 
  - ArrowClockwise (Phosphor) for reset button
  - Circle (Phosphor) filled variants for piece representations in UI
  - User (Phosphor) for player vs player mode
  - Robot (Phosphor) for AI opponent mode and thinking indicator
- **Spacing**: 
  - Board padding: p-6
  - Grid gap: gap-1 (tight grid lines)
  - Card padding: p-8
  - Section spacing: space-y-6
  - Mode button grid: gap-2
- **Mobile**: 
  - Board scales down maintaining square aspect ratio
  - Score display moves below board on small screens
  - Touch-friendly piece placement with larger hit areas
  - Reduce piece size on narrow viewports
  - Stack mode selection buttons vertically on small screens
