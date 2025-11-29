# Naruto Blazing - Codebase Summary

## Project Overview

**Naruto Blazing** is a full-featured web-based gacha RPG game inspired by the mobile game "Naruto Shippuden: Ultimate Ninja Blazing". This is a browser-based implementation featuring:

- **823+ playable characters** from the Naruto universe
- **Turn-based battle system** with chakra mechanics
- **Gacha summon system** with multiple banners and pity mechanics
- **Character progression** (leveling, awakening, limit breaking)
- **Team building** and strategy gameplay
- **Mission system** with difficulty tiers
- **Full game economy** (currencies, shop, resources)

**Tech Stack:**
- Frontend: Pure HTML/CSS/JavaScript (no framework)
- Backend: Node.js/Express API server (optional)
- Data Storage: JSON files + localStorage/IndexedDB
- Total Content: 823 characters = 132,651 lines in characters.json

---

## HTML Files (14 files)

### Main Game Pages

#### index.html - Dashboard/Home Page
The main hub of the game featuring:
- Character vignette display showcasing your collection
- Announcement slideshow for events and updates
- Navigation to all game sections
- Ninja rank and currency display (Pearls, Shinobites, Ryo)
- Bottom icon bar with 10 utility functions

**Why it's important:** This is the entry point and central navigation hub for the entire game.

#### battle.html - Battle System
The combat interface implementing:
- Turn-based combat with speed gauge system
- Team and bench display with character portraits
- Chakra wheel mechanics for resource management
- Enemy wave system
- Attack animations and damage calculations

**Why it's important:** Contains the core gameplay loop where players engage in tactical combat.

#### characters.html - Character Collection
Character management interface with:
- Grid view of all owned characters
- Detailed character modal with tabs: Status, Awakening, Ninjutsu, F/B Skills, Abilities, Equipment
- Level up, awakening, and limit break functions
- Duplicate feeding system for ability unlocks

**Why it's important:** Central hub for character progression and collection management.

#### summon.html - Gacha Summon
The gacha system page featuring:
- Banner carousel with character previews
- Single/Multi summon options
- Double Fibonacci-based pity system
- Summon animations and results display
- Currency tracking

**Why it's important:** Primary method for acquiring new characters, driving player engagement.

#### teams.html - Team Formation
Team building interface with:
- 3 team slots (Team 1, 2, 3)
- Front row (4 units) + Back row (4 units)
- Bench slots (2 units)
- Commander system for team bonuses
- Cost calculation (max 408)
- Team stats preview

**Why it's important:** Strategic team composition is essential for battle success.

#### missions.html - Mission Selection
Mission browser with:
- Categorized missions (Shinobi Chronicles, Limited Time Events)
- Difficulty selection (C, B, A, S ranks)
- Mission banners showing rewards
- Routes to team setup before battle

**Why it's important:** Provides structured content and progression path for players.

#### fusion.html - Character Fusion
Character fusion system with:
- Two unit selection slots
- Fusion requirements display
- Result preview
- Material costs calculation

**Why it's important:** Allows players to create special characters through fusion.

#### shop.html - Ninja Shop
In-game shop with:
- Three tabs: Training Ramen, Materials, Resources
- Purchase system using Ryo/Pearls
- Item descriptions and costs

**Why it's important:** Economy system for resource acquisition without gacha.

#### inventory.html - Inventory Management
Inventory tracking system for:
- Materials and resources
- Sorting and filtering options

**Why it's important:** Resource management for progression systems.

#### resources.html - Resource Overview
Resource tracking dashboard for:
- Currency balances
- Material inventory
- Resource management

**Why it's important:** Gives players visibility into their assets.

#### settings.html - Game Settings
Settings interface with:
- Audio controls (Master, BGM, SFX)
- Display settings
- Account settings

**Why it's important:** Player customization and preferences.

### Demo/Testing Pages

- **chakra-holder-demo.html** - Chakra system UI testing
- **test-bench-chakra.html** - Bench chakra accumulation testing
- **HTML_UPDATE_SNIPPET.html** - Code snippet template

**Why they're important:** Development and debugging tools for specific features.

---

## CSS Files (36 files)

### Core Layout & Canvas (4 files)

#### game-canvas.css
- Implements 16:9 responsive game canvas wrapper system
- Ensures consistent aspect ratio across devices
- Centers game content in viewport

**Why it's important:** Maintains professional mobile game appearance on all screen sizes.

#### ui-layout.css
- Base UI layout and positioning system
- Grid systems and flexbox layouts
- Z-index management

**Why it's important:** Foundation for all UI elements and their spatial relationships.

#### background.css
- Dynamic background system
- Gradient and image backgrounds
- Parallax effects

**Why it's important:** Visual atmosphere and polish.

#### characters_background.css
- Character page-specific backgrounds
- Custom styling for character screens

**Why it's important:** Page-specific visual identity.

### Dashboard & Home (3 files)

#### dashboard.css
- Main dashboard interactive elements
- Slanted headers with animations
- Button styles and hover effects

**Why it's important:** Creates the engaging home screen experience.

#### top-bar.css
- Ninja rank display
- Username display
- Currency HUD (Pearls, Shinobites, Ryo)

**Why it's important:** Persistent player status information.

#### bottombar.css
- Bottom navigation icon bar
- Icon states and animations

**Why it's important:** Primary navigation system.

### Battle System (9 files)

#### battle.css
- Main battle scene layout
- Unit positioning system
- Battle HUD elements

**Why it's important:** Core layout for combat interface.

#### battle-ui-fixes.css
- Battle UI bug fixes and adjustments
- Edge case handling
- Cross-browser compatibility

**Why it's important:** Ensures stable battle UI.

#### battle-results-professional.css
- Victory/defeat results screen styling
- Rewards display
- Animation transitions

**Why it's important:** Satisfying completion feedback.

#### battle-team-holder.css
- Battle team display panel
- Character portraits in battle
- Active/inactive states

**Why it's important:** Visual team representation during combat.

#### battle-chakra-wheel.css
- Chakra wheel UI component styling
- Segment rendering (individual chakra bars)
- Visual feedback for chakra accumulation

**Why it's important:** Central resource management mechanic visualization.

#### battle-attack-names.css
- Attack name displays during combat
- Animation timing
- Typography styling

**Why it's important:** Dynamic combat feedback.

#### battle-equipped-ultimate.css
- Equipped ultimate ability displays
- Ultimate skill indicators

**Why it's important:** Shows special abilities available.

#### character_battle_system.css
- Character-specific battle styles
- Unit card styling
- HP bars and status indicators

**Why it's important:** Individual character representation.

#### status_effects.css
- Status effect icons and animations
- Buff/debuff visual indicators
- Effect stacking display

**Why it's important:** Communicates combat modifiers.

### Character Management (5 files)

#### characters.css
- Character grid layout
- Character modal dialogs
- Stats display formatting

**Why it's important:** Main character management interface.

#### character-vignette.css
- Character vignette display on dashboard
- Featured character showcase

**Why it's important:** Engaging character showcase.

#### character-equip.css
- Equipment system UI
- Equipment slots
- Item display

**Why it's important:** Equipment mechanic visualization.

#### characters_abilities.css
- Ability display system
- Skill icons and descriptions

**Why it's important:** Shows character capabilities.

#### character_dupe_abilities.css
- Duplicate awakening UI
- Ability unlock progress

**Why it's important:** Progression tracking for duplicate system.

### Summon System (4 files)

#### summon.css
- Main summon page layout
- Wind particle effects
- Banner displays

**Why it's important:** Creates exciting gacha atmosphere.

#### summon-banner-carousel.css
- Banner carousel navigation
- Smooth transitions
- Preview system

**Why it's important:** User-friendly banner selection.

#### summon-dev-panel.css
- Developer testing panel
- Debug controls
- Rate adjustment tools

**Why it's important:** Development and testing efficiency.

#### summon-results.css
- Summon results animation
- Character reveal effects
- Rarity indicators

**Why it's important:** Peak engagement moment for players.

### Other Game Systems (6 files)

- **missions.css** - Mission selection layout and styling
- **teams.css** - Team formation interface styling
- **fusion.css** - Character fusion UI styling
- **shop.css** - Shop interface and item displays
- **inventory.css** - Inventory grid and management
- **rank-system.css** - Ninja rank progression displays

**Why they're important:** Each provides the visual interface for their respective game systems.

### Utility & Components (5 files)

- **modal-system.css** - Global modal dialog system
- **settings-modal.css** - Settings menu styling
- **music-player.css** - Background music player controls
- **chakra-holder.css** - Chakra display component
- **debug-bench-visibility.css** - Debug visibility helpers

**Why they're important:** Reusable UI components used throughout the game.

---

## JavaScript Files (94 files)

### Core Systems (9 files)

#### storage-manager.js
- IndexedDB/localStorage wrapper using localForage
- Async storage operations
- Player data persistence

**Why it's important:** Foundation for saving all player progress.

#### audio-manager.js
- Sound and music management
- Volume controls (Master, BGM, SFX)
- Audio asset loading

**Why it's important:** Game atmosphere and user experience.

#### touch-manager.js
- Touch/gesture input handling
- Mobile support
- Drag and drop functionality

**Why it's important:** Mobile device compatibility.

#### modal-manager.js
- Global modal dialog system
- Modal lifecycle management
- Overlay controls

**Why it's important:** Consistent dialog system across the game.

#### navigation.js
- Page navigation and transitions
- Route management
- History handling

**Why it's important:** Seamless page transitions.

#### music-player.js
- Background music player
- Playlist management
- Fade in/out effects

**Why it's important:** Continuous audio experience.

#### user-profile.js
- Username and profile management
- Player identity

**Why it's important:** Personalization.

#### currency.js
- Currency system (Pearls, Shinobites, Ryo)
- Transaction handling
- Balance tracking

**Why it's important:** Core economy system.

#### resources.js
- Resource tracking and management
- Material inventory
- Resource consumption

**Why it's important:** Progression material management.

### Character Systems (9 files)

#### characters.js
- Character grid and modal UI
- Character display logic
- Tab navigation

**Why it's important:** Primary character interface controller.

#### character_inv.js
- Character inventory management
- Collection tracking
- Sorting and filtering

**Why it's important:** Character collection organization.

#### character-evolution.js
- Evolution/awakening logic
- Tier upgrades
- Transformation calculations

**Why it's important:** Character progression mechanic.

#### character-vignette.js
- Dashboard character display
- Featured character rotation

**Why it's important:** Engaging dashboard content.

#### character-equip.js
- Equipment system logic
- Equipment application
- Stat modifications

**Why it's important:** Equipment mechanic implementation.

#### characters_abilities.js
- Ability display logic
- Skill descriptions
- Ability unlocks

**Why it's important:** Shows character capabilities.

#### character_dupe_abilities.js
- Duplicate awakening system
- Ability unlock progression

**Why it's important:** Duplicate system implementation.

#### awakening.js
- Awakening transformation system
- Material validation
- Transformation execution

**Why it's important:** Major progression mechanic.

#### limit-break.js
- Limit break progression (0-10 levels)
- Stat improvements
- Material costs

**Why it's important:** End-game character enhancement.

### Battle System (24+ files in /js/battle/)

#### battle-core.js
- Main battle orchestrator
- State management
- Battle initialization

**Why it's important:** Central controller for all combat.

#### battle-units.js
- Unit creation and management
- Stats calculation
- Position tracking

**Why it's important:** Character representation in battle.

#### battle-combat.js
- Attack calculations
- Damage formulas
- Hit resolution

**Why it's important:** Core combat mechanics.

#### battle-chakra.js
- Chakra generation and management
- Chakra accumulation per turn
- Resource tracking

**Why it's important:** Combat resource system.

#### battle-chakra-wheel.js
- Chakra wheel UI rendering
- Individual segment display
- Visual feedback

**Why it's important:** Resource visualization.

#### battle-drag.js
- Drag and drop for unit movement
- Position validation
- Movement animations

**Why it's important:** Tactical positioning.

#### battle-swap.js
- Unit swapping between active/bench
- Swap validation
- Cooldown management

**Why it's important:** Dynamic team composition.

#### battle-turns.js
- Turn order calculation
- Speed gauge system
- Initiative management

**Why it's important:** Combat flow control.

#### battle-animations.js
- Combat animations
- Attack effects
- Transition timing

**Why it's important:** Visual feedback.

#### battle-attack-names.js
- Attack name displays
- Dynamic text rendering

**Why it's important:** Combat flavor and feedback.

#### battle-buffs.js
- Buff/debuff system
- Duration tracking
- Stat modifications

**Why it's important:** Strategic combat depth.

#### battle-passives.js
- Passive ability processing
- Automatic effects
- Conditional triggers

**Why it's important:** Character unique abilities.

#### battle-modifiers.js
- Stat modifier calculations
- Multiplicative and additive modifiers
- Type effectiveness

**Why it's important:** Combat calculation accuracy.

#### battle-narrator.js
- Battle log and narration
- Event descriptions
- Combat feedback

**Why it's important:** Player understanding of combat events.

#### battle-finish.js
- Victory/defeat conditions
- Rewards calculation
- Battle cleanup

**Why it's important:** Battle completion handling.

**Additional battle files:**
- battle-field-controller.js - Field position management
- battle-entrance.js - Battle entrance animations
- battle-equipped-ultimate.js - Equipped ultimate system
- battle-hp-fix.js - HP calculation fixes
- battle-input-manager.js - Input handling
- battle-missions.js - Mission objectives
- battle-particles.js - Particle effects
- battle-physics.js - Movement physics
- battle-team-holder.js - Team display panel

**Why they're important:** Each handles a specific aspect of the complex battle system, making it maintainable and modular.

### Summon System (9 files in /js/summon/)

#### summon-engine.js
- Double Fibonacci gacha algorithm
- Gold Chance Sequence (determines gold pull)
- Featured Chance Sequence (determines featured character)
- Progressive pity rates

**Why it's important:** Fair and predictable gacha mechanics.

#### summon-animation.js
- Pull animations
- Character reveal sequences
- Rarity indicators

**Why it's important:** Exciting summoning experience.

#### summon-ui.js
- Summon interface management
- Button states
- Currency display

**Why it's important:** User interaction handling.

#### summon-carousel.js
- Banner carousel functionality
- Banner navigation
- Preview updates

**Why it's important:** Banner selection interface.

#### summon-banner-slideshow.js
- Auto-rotating banner preview
- Featured character displays

**Why it's important:** Visual engagement.

#### summon-currency.js
- Pearl/currency management for summons
- Cost validation
- Transaction handling

**Why it's important:** Economy integration.

#### summon-data.js
- Banner data loading
- Rate configuration
- Pool management

**Why it's important:** Summon configuration.

#### summon-dev-panel.js
- Developer testing tools
- Rate manipulation
- Debug controls

**Why it's important:** Development efficiency.

#### summon.js (root)
- Main summon page controller
- System initialization

**Why it's important:** Summon system orchestration.

### Dashboard Systems (6 files)

- **dashboard-announcements.js** - Announcement system
- **dashboard-banner-slideshow.js** - Banner slideshow
- **dashboard-calendar.js** - Login calendar (14-day rewards)
- **dashboard-mailbox.js** - Present box/mailbox
- **dashboard-stats.js** - Collection statistics
- **announcement-slideshow.js** - Rotating announcements

**Why they're important:** Create an engaging and informative home screen experience.

### Mission & Progression Systems (7 files)

- **missions.js** - Mission selection and loading
- **mission-progress.js** - Mission completion tracking
- **daily-missions.js** - Daily mission system (5 dailies)
- **panel-missions.js** - Panel mission board
- **ninja-rank.js** - Ninja rank progression (100 ranks)
- **progression.js** - Character level/stat progression
- **exp-rewards.js** - Experience and rewards calculation

**Why they're important:** Provide structured progression and daily engagement.

### Other Game Features (8 files)

- **team_manager.js** - Team formation and management
- **fusion.js** - Character fusion system
- **shop.js** - Shop purchasing system
- **inventory.js** - Inventory UI and management
- **status_effects.js** - Status effect logic (buffs, debuffs, ailments)
- **status_ui.js** - Status effect UI display
- **gift-code-system.js** - Redemption codes
- **player-save-system.js** - Save/load game state

**Why they're important:** Each implements a complete game feature.

### UI Components (4 files)

- **top-bar.js** - Top HUD bar controller
- **top-bar-enhanced.js** - Enhanced top bar features
- **settings-modal.js** - Settings UI controller
- **username.js** - Username management

**Why they're important:** Consistent UI components across pages.

### Backend/Server (5 files in /backend/)

#### server.js
- Express API server
- Character endpoints
- CORS configuration

**Why it's important:** Optional backend for character data serving.

#### admin-routes.js
- Admin API routes
- Character CRUD operations
- Administrative functions

**Why it's important:** Content management system.

#### admin-cli.js
- Command-line admin tools
- Batch operations

**Why it's important:** Developer productivity.

#### add-evolution.js
- Evolution data management
- Character transformation tools

**Why it's important:** Evolution system management.

#### upload-middleware.js
- File upload handling
- Asset management

**Why it's important:** Asset upload support.

### Utility Scripts (7 files)

#### validate-content.js
- JSON validation system
- Schema validation
- Asset existence checks
- Cross-reference integrity

**Why it's important:** Prevents broken content from being committed.

#### validation-config.js
- Validation rules configuration
- Customizable validation parameters
- Rarity ranges, stat limits

**Why it's important:** Flexible content validation rules.

#### content-stats.js
- Content statistics generator
- Character counts by rarity
- Mission counts
- Banner statistics

**Why it's important:** Content overview and metrics.

#### content-diff.js
- Content change tracking
- Diff generation between versions

**Why it's important:** Change management.

**Additional utility files:**
- batch-add-characters.js - Batch character import
- character-api-service.js - Character API client
- debug-bench-chakra.js - Bench chakra debugging

**Why they're important:** Development tools for content management.

---

## JSON Files (19 files)

### Character Data (4 files)

#### characters.json (132,651 lines)
The massive character database containing **823+ playable characters** with:
- Character metadata: id, name, version, element, rarity (3-10 stars)
- Complete stat tables: HP, ATK, DEF, SPD for each tier (base, awakened, max)
- Skills: Ninjutsu, Ultimate, Field skills, Buddy skills
- Abilities: 5 unlockable abilities per character
- Art assets: portrait paths, full art, animations by tier
- Evolution paths: starMinCode, starMaxCode for transformations
- Limit break data: stat bonuses per LB level

**Why it's important:** This is the heart of the game - every character players can collect and use. The entire game revolves around this data.

#### characters1.json & characters2.json (550 + 798 lines)
Legacy character subset files from earlier development.

**Why they're important:** Backward compatibility or data migration support.

#### awakening-transforms.json (1,852 lines)
Character evolution transformation mappings:
- Tier upgrades (3★→4★, 5★→6★, etc.)
- Transformation IDs linking pre/post evolution
- Evolution requirements

**Why it's important:** Defines which characters can evolve into which forms.

### Mission System (3 files)

#### missions.json (567 lines)
Contains **47 missions** with:
- Mission categories: Shinobi Chronicles, Limited Time Events
- Difficulty tiers: C, B, A, S ranks
- Stage structure: map layouts, enemy wave configurations
- Mission banners and display data
- Sort order and grouping

**Why it's important:** Provides all structured content and progression paths.

#### mission-rewards.json (327 lines)
Reward tables for missions:
- Completion rewards (Ryo, EXP, materials)
- First-time clear bonuses
- Objective-based rewards (no continues, all alive, etc.)

**Why it's important:** Incentivizes mission completion and replay.

#### enemies.json (20 lines)
Enemy unit definitions:
- Enemy stats
- Enemy abilities
- AI behavior patterns

**Why it's important:** Defines combat opponents.

### Summon System (1 file)

#### summon.json (993 lines)
Complete summon configuration:
- Multiple summon banners (Blazing Festival, Step-Up, etc.)
- Featured characters per banner
- Rate pools and percentages
- Step-up mechanics (discounts, guarantees)
- Fibonacci pity system configuration

**Why it's important:** Defines the entire gacha acquisition system - the primary monetization and engagement mechanic.

### Character Progression (3 files)

#### awakening-requirements.json (117 lines)
Materials needed for awakening:
- Requirements per tier upgrade (3★→4★, 4★→5★, etc.)
- Material types and quantities
- Ryo costs

**Why it's important:** Defines the resource cost of character evolution.

#### limit-break-costs.json (50 lines)
Limit break material costs:
- Costs per LB level (0-10)
- Material scaling

**Why it's important:** Defines end-game character enhancement costs.

#### ninja-ranks.json (102 lines)
Player rank progression system:
- **100 ninja ranks**
- XP requirements per rank
- Progressive difficulty curve

**Why it's important:** Player account progression system.

### Shop & Economy (1 file)

#### shop.json (121 lines)
In-game shop inventory:
- **Training Ramen:** 1★-4★ (100-10,000 EXP)
- **Awakening Materials:** Elemental scrolls, crystals
- **Resources:** Other consumables
- Pricing in Ryo/Pearls

**Why it's important:** Alternative acquisition path for progression materials.

### Daily Content (2 files)

#### daily-missions.json (162 lines)
Daily engagement content:
- **5 daily missions** with rewards
- **14-day login calendar** with progressive rewards
- Special rewards on Day 7 and Day 14

**Why it's important:** Daily player retention mechanic.

#### announcements.json (112 lines)
**10 announcements** including:
- Maintenance notifications
- Event announcements
- New banner releases
- Priority system (high, medium, low)
- Date ranges and icons
- Auto-rotate configuration

**Why it's important:** Player communication and event awareness.

### Specialized Systems (5 files)

#### panel.json (116 lines)
Panel mission board system:
- Grid-based mission board
- Mission objectives
- Progressive rewards

**Why it's important:** Alternative mission/progression system.

#### fusions.json (34 lines)
Character fusion recipes:
- Fusion input requirements (2 characters)
- Result character outputs
- Material costs

**Why it's important:** Special character acquisition method.

#### equip-ultimates.json (276 lines)
Equippable ultimate abilities:
- Ultimate ability stats
- Effects and multipliers
- Equipment restrictions

**Why it's important:** Additional customization layer for characters.

#### gift-codes.json (52 lines)
Redemption code system:
- Valid codes
- Rewards per code
- Expiration dates

**Why it's important:** Marketing and player rewards.

#### domains.json (1 line)
Domain/realm data structure.

**Why it's important:** Future feature or data organization.

### Configuration Files (2 files)

#### package.json (26 lines)
NPM project configuration:
- Scripts: `validate`, `content:diff`, `content:stats`
- Dev dependencies: husky, nodemon
- Pre-commit hook setup

**Why it's important:** Project automation and validation pipeline.

#### backend/package.json
Backend server dependencies:
- Express framework
- CORS middleware
- File upload handling

**Why it's important:** Backend server configuration.

---

## Architecture Highlights

### Data-Driven Design
The game is **completely data-driven**:
- Adding 100 new characters requires only editing `characters.json`
- New missions, banners, shop items - all JSON edits
- Zero code changes needed for most content updates

**Why it's important:** Enables rapid content iteration and non-programmer content management.

### Validation Pipeline
Pre-commit hooks automatically validate:
- JSON schema correctness
- Asset file existence (every character art path validated)
- Cross-reference integrity (evolution IDs, fusion recipes)
- Stat balance checks (customizable ranges)

**Why it's important:** Prevents broken content from being deployed.

### Hybrid Storage Strategy
- **Static content** (characters, missions, shop): JSON files → Git versioned
- **Player data** (inventory, teams, progress): localStorage/IndexedDB
- **Future**: PostgreSQL for multiplayer player data

**Why it's important:** Optimal performance and scalability.

### Battle System Complexity
The most complex subsystem with **24+ modules**:
- Turn-based with speed gauge
- Chakra resource management with individual segment tracking
- Buff/debuff system with duration tracking
- Commander system for team bonuses
- Bench accumulation mechanics
- Status effects (ailments, immunities)

**Why it's important:** Deep tactical gameplay requiring modular architecture.

### Summon System Innovation
Implements **Double Fibonacci pity system**:
1. **Gold Chance Sequence**: Fibonacci progression for gold pulls
2. **Featured Chance Sequence**: Fibonacci progression for featured characters
3. Progressive rates increase with each multi-summon
4. Fully configurable via JSON

**Why it's important:** Fair, predictable gacha with player-friendly pity mechanics.

---

## Summary

**Naruto Blazing** is a production-quality web-based gacha RPG with:

- **Complete game loop:** Summon → Level → Awaken → Battle → Missions → Repeat
- **823+ characters** with full stat systems, abilities, and progression
- **47 missions** across multiple difficulties
- **Professional UI/UX** matching mobile game standards
- **Enterprise architecture:** Validation pipelines, staging workflows, deployment-ready
- **Clean, modular codebase** with separation of concerns
- **Data-first approach** enabling rapid content iteration

### Key Technical Achievements:
- **132,651 lines** of character data validated and versioned
- **Modular CSS architecture** (36 files) for maintainability
- **IIFE-based JavaScript modules** (94 files) with clear dependencies
- **Comprehensive validation tooling** preventing content errors
- **Hybrid storage strategy** optimizing static vs. dynamic data
- **Production deployment readiness** with staging environment support

This codebase demonstrates advanced web development practices including proper separation of concerns, data-driven design, comprehensive testing infrastructure, and scalable architecture patterns.
