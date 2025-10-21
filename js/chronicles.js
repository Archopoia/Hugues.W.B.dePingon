// Chronicles - Gamified Blog System
// Location: /home/hullivan/Hugues.W.B.dePingon/js/chronicles.js

// Chronicles data structure (in a real app, this would come from a CMS or database)
const chroniclesData = {
    1: {
        id: 1,
        title: "The Art of AI Behavior Trees: Lessons from The Wayward Realms",
        category: "game-design",
        date: "2025-01-15",
        readTime: 12,
        xpReward: 150,
        content: `
            <h1>The Art of AI Behavior Trees: Lessons from The Wayward Realms</h1>
            <p><em>January 15, 2025 • 12 minute read</em></p>

            <h2>Introduction</h2>
            <p>Creating believable NPCs is one of the greatest challenges in game design. In The Wayward Realms, we're pushing the boundaries of AI behavior systems to create a living, breathing world where every character feels unique and purposeful.</p>

            <h2>What Are Behavior Trees?</h2>
            <p>Behavior Trees are a hierarchical structure for organizing AI decision-making. Unlike Finite State Machines (FSMs), Behavior Trees offer greater flexibility and modularity. They consist of:</p>
            <ul>
                <li><strong>Composite Nodes:</strong> Control flow (Sequence, Selector, Parallel)</li>
                <li><strong>Decorator Nodes:</strong> Modify behavior of child nodes</li>
                <li><strong>Leaf Nodes:</strong> Actions and conditions</li>
            </ul>

            <h2>Integrating GOAP with Behavior Trees</h2>
            <p>While Behavior Trees excel at reactive behaviors, Goal-Oriented Action Planning (GOAP) provides long-term planning capabilities. We've developed a hybrid system that leverages both:</p>
            <pre><code>// Example GOAP goal structure
const goal = {
    name: "FindFood",
    priority: 0.8,
    conditions: {
        hasFood: true,
        hunger: 0
    }
};</code></pre>

            <h2>Practical Implementation</h2>
            <p>In The Wayward Realms, NPCs use this hybrid approach to:</p>
            <ul>
                <li>Plan long-term goals (GOAP)</li>
                <li>Execute immediate reactions (Behavior Trees)</li>
                <li>Adapt to player actions dynamically</li>
            </ul>

            <h2>Challenges and Solutions</h2>
            <p>One major challenge was performance. With hundreds of NPCs active simultaneously, we needed optimization strategies:</p>
            <ol>
                <li><strong>LOD System:</strong> NPCs far from the player use simplified AI</li>
                <li><strong>Tick Budgeting:</strong> Distribute AI updates across frames</li>
                <li><strong>Caching:</strong> Store frequently accessed pathfinding data</li>
            </ol>

            <h2>Results</h2>
            <p>The result is a world that feels alive. Guards change shifts, merchants travel to restock, and NPCs react meaningfully to your reputation and actions. This level of simulation creates emergent storytelling that's different for every player.</p>

            <h2>Conclusion</h2>
            <p>Behavior Trees combined with GOAP provide a powerful framework for creating believable AI. The key is finding the right balance between reactive and goal-oriented behaviors for your specific game needs.</p>

            <p><strong>Want to learn more?</strong> Check out my tutorial on implementing GOAP in Godot!</p>
        `
    },
    2: {
        id: 2,
        title: "Ethics in Game AI: Should NPCs Have Rights?",
        category: "philosophy",
        date: "2025-01-10",
        readTime: 8,
        xpReward: 100,
        content: `
            <h1>Ethics in Game AI: Should NPCs Have Rights?</h1>
            <p><em>January 10, 2025 • 8 minute read</em></p>

            <h2>The Question</h2>
            <p>As NPCs become increasingly sophisticated—especially with LLM integration—we're approaching a philosophical crossroads. When does a simulated consciousness deserve ethical consideration?</p>

            <h2>The Philosophical Framework</h2>
            <p>Drawing from my MPhil in Applied Ethics, I approach this through three lenses:</p>
            <ol>
                <li><strong>Consequentialism:</strong> Do our design choices lead to better outcomes?</li>
                <li><strong>Deontology:</strong> Do we have duties to our creations?</li>
                <li><strong>Virtue Ethics:</strong> What kind of designers should we be?</li>
            </ol>

            <h2>The Simulation Argument</h2>
            <p>If an NPC's internal experience is indistinguishable from consciousness to an observer, does it matter whether it's "real"? This mirrors debates in philosophy of mind about p-zombies and the hard problem of consciousness.</p>

            <h2>Practical Implications</h2>
            <p>These aren't just abstract questions. They affect design decisions:</p>
            <ul>
                <li>Should we design NPCs capable of suffering?</li>
                <li>What are our responsibilities when creating "living" worlds?</li>
                <li>How do we balance player freedom with NPC dignity?</li>
            </ul>

            <h2>A Designer's Responsibility</h2>
            <p>I argue that while NPCs may not deserve rights in a legal sense, we as designers have a responsibility to thoughtfully consider the worlds we create. This shapes player psychology and cultural norms around AI.</p>

            <h2>Conclusion</h2>
            <p>The question isn't whether to give NPCs rights today, but how we prepare for a future where the line between simulation and consciousness becomes increasingly blurred.</p>
        `
    },
    3: {
        id: 3,
        title: "Building Your First GOAP System in Godot",
        category: "tutorials",
        date: "2025-01-05",
        readTime: 15,
        xpReward: 200,
        content: `
            <h1>Building Your First GOAP System in Godot</h1>
            <p><em>January 5, 2025 • 15 minute read</em></p>

            <h2>What is GOAP?</h2>
            <p>Goal-Oriented Action Planning (GOAP) is an AI architecture that allows agents to formulate plans to achieve goals. Unlike scripted behaviors, GOAP agents can adapt to changing circumstances.</p>

            <h2>Prerequisites</h2>
            <ul>
                <li>Godot 4.x installed</li>
                <li>Basic GDScript knowledge</li>
                <li>Understanding of object-oriented programming</li>
            </ul>

            <h2>Step 1: Define the World State</h2>
            <pre><code>extends Node
class_name GOAPWorldState

var state: Dictionary = {}

func set_state(key: String, value):
    state[key] = value

func get_state(key: String):
    return state.get(key, null)

func meets_conditions(conditions: Dictionary) -> bool:
    for key in conditions:
        if state.get(key) != conditions[key]:
            return false
    return true</code></pre>

            <h2>Step 2: Create Actions</h2>
            <pre><code>extends Node
class_name GOAPAction

var action_name: String
var cost: float = 1.0
var preconditions: Dictionary = {}
var effects: Dictionary = {}

func can_run(world_state: GOAPWorldState) -> bool:
    return world_state.meets_conditions(preconditions)

func perform() -> bool:
    # Override this in child classes
    return true</code></pre>

            <h2>Step 3: Implement the Planner</h2>
            <pre><code>extends Node
class_name GOAPPlanner

func plan(actions: Array, world_state: GOAPWorldState, goal: Dictionary) -> Array:
    var available_actions = actions.duplicate()
    var plan = []
    var current_state = world_state.state.duplicate()

    while not _meets_goal(current_state, goal):
        var best_action = _find_best_action(available_actions, current_state, goal)
        if best_action == null:
            return []  # No plan found

        plan.append(best_action)
        _apply_effects(current_state, best_action.effects)
        available_actions.erase(best_action)

    return plan</code></pre>

            <h2>Step 4: Example Usage</h2>
            <pre><code># Create a simple "Get Food" action
extends GOAPAction

func _init():
    action_name = "Get Food"
    cost = 5.0
    preconditions = {"near_food": true}
    effects = {"has_food": true}

func perform() -> bool:
    print("Gathering food...")
    return true</code></pre>

            <h2>Common Pitfalls</h2>
            <ol>
                <li><strong>Infinite Loops:</strong> Always ensure goals are achievable</li>
                <li><strong>Performance:</strong> Cache plans when world state hasn't changed</li>
                <li><strong>Action Costs:</strong> Carefully balance costs to avoid unrealistic behavior</li>
            </ol>

            <h2>Next Steps</h2>
            <p>This is a basic implementation. To make it production-ready:</p>
            <ul>
                <li>Add A* pathfinding to the planner</li>
                <li>Implement action interruption</li>
                <li>Create a visual debugger</li>
                <li>Add dynamic goal prioritization</li>
            </ul>

            <h2>Conclusion</h2>
            <p>GOAP is a powerful tool for creating intelligent, adaptive AI. While the initial setup requires more work than simple state machines, the flexibility and emergent behavior make it worthwhile for complex games.</p>

            <p><strong>Download the full example project from my GitHub!</strong></p>
        `
    },
    4: {
        id: 4,
        title: "Creating Believable Cultures: The Discording Tales Method",
        category: "worldbuilding",
        date: "2024-12-28",
        readTime: 10,
        xpReward: 120,
        content: `
            <h1>Creating Believable Cultures: The Discording Tales Method</h1>
            <p><em>December 28, 2024 • 10 minute read</em></p>

            <h2>The Challenge of Cultural Authenticity</h2>
            <p>When creating The Discording Tales, a 300-page tabletop RPG, I faced a common problem: how do you create cultures that feel real without simply copying Earth cultures?</p>

            <h2>The Anthropological Approach</h2>
            <p>Drawing from my background in anthropology, I developed a systematic method:</p>

            <h3>1. Environmental Foundation</h3>
            <p>Culture emerges from environment. Before designing customs, I establish:</p>
            <ul>
                <li>Climate and geography</li>
                <li>Available resources</li>
                <li>Natural threats and opportunities</li>
                <li>Seasonal patterns</li>
            </ul>

            <h3>2. Subsistence Patterns</h3>
            <p>How people acquire food shapes everything:</p>
            <ul>
                <li>Hunter-gatherers: Egalitarian, mobile societies</li>
                <li>Pastoralists: Hierarchical, territorial</li>
                <li>Agriculturalists: Sedentary, complex social structures</li>
            </ul>

            <h3>3. Social Organization</h3>
            <p>From subsistence patterns, social structures emerge naturally:</p>
            <pre><code>// Example cultural framework
const culture = {
    subsistence: "Agricultural",
    societal_structure: "Chiefdom",
    kinship: "Matrilineal",
    marriage: "Polygynous",
    residence: "Matrilocal"
};</code></pre>

            <h2>The Neuroscience Angle</h2>
            <p>My neuroscience background informed how cultures differ in cognition:</p>
            <ul>
                <li><strong>Individualist vs. Collectivist:</strong> Different self-concepts</li>
                <li><strong>Time Perception:</strong> Linear vs. cyclical thinking</li>
                <li><strong>Spatial Reasoning:</strong> Absolute vs. relative frames of reference</li>
            </ul>

            <h2>The Discording Tales Example</h2>
            <p>One culture in the game, the Khevren, demonstrates this approach:</p>
            <ul>
                <li><strong>Environment:</strong> Harsh desert, scarce water</li>
                <li><strong>Subsistence:</strong> Nomadic pastoralism</li>
                <li><strong>Result:</strong> Honor-based society, complex hospitality rules, oral tradition emphasis</li>
            </ul>

            <h2>Avoiding Common Traps</h2>
            <ol>
                <li><strong>Planet of Hats:</strong> Don't make cultures one-dimensional</li>
                <li><strong>Exoticism:</strong> Avoid making "foreign" = "interesting"</li>
                <li><strong>Static Cultures:</strong> Show internal diversity and change</li>
            </ol>

            <h2>Practical Application</h2>
            <p>For game designers, this method provides:</p>
            <ul>
                <li>Internally consistent cultures</li>
                <li>Rich storytelling opportunities</li>
                <li>Meaningful player choices based on cultural context</li>
            </ul>

            <h2>Conclusion</h2>
            <p>Creating believable cultures requires understanding the interconnected systems that shape human societies. By building from environmental foundations up, you create worlds that feel lived-in and authentic.</p>
        `
    },
    5: {
        id: 5,
        title: "Wayward Realms Dev Diary #1: Procedural Generation Challenges",
        category: "dev-diary",
        date: "2024-12-20",
        readTime: 7,
        xpReward: 90,
        content: `
            <h1>Wayward Realms Dev Diary #1: Procedural Generation Challenges</h1>
            <p><em>December 20, 2024 • 7 minute read</em></p>

            <h2>The Vision</h2>
            <p>The Wayward Realms aims to create a world as vast as Daggerfall but with modern sophistication. That means massive procedural generation—but done right.</p>

            <h2>Challenge 1: Scale vs. Meaning</h2>
            <p>Our first major challenge: how do you create a world with thousands of locations that still feels handcrafted?</p>

            <h3>Our Solution:</h3>
            <ul>
                <li><strong>Seed-based consistency:</strong> Same seeds always generate same results</li>
                <li><strong>Designer oversight:</strong> Hand-authored templates guide generation</li>
                <li><strong>Context awareness:</strong> Generation considers surrounding regions</li>
            </ul>

            <h2>Challenge 2: Performance</h2>
            <p>Generating content on-the-fly while maintaining 60fps is brutal. We've implemented:</p>
            <pre><code>// Chunked generation with time budgeting
var generation_budget_ms = 16.0  // Leave time for rendering
var chunk_queue = []

func _process(delta):
    var start_time = Time.get_ticks_msec()

    while chunk_queue.size() > 0:
        if Time.get_ticks_msec() - start_time > generation_budget_ms:
            break
        generate_chunk(chunk_queue.pop_front())</code></pre>

            <h2>Challenge 3: Memorable Moments</h2>
            <p>Procedural doesn't mean random. We use "memorable event" injection:</p>
            <ul>
                <li>Unique encounters based on player history</li>
                <li>Story beats integrated into generated content</li>
                <li>Persistent world changes from player actions</li>
            </ul>

            <h2>What's Working</h2>
            <ul>
                <li>Cities feel unique and culturally distinct</li>
                <li>Wilderness exploration remains engaging</li>
                <li>Performance meets our targets</li>
            </ul>

            <h2>What's Not (Yet)</h2>
            <ul>
                <li>Dungeon variety needs more templates</li>
                <li>NPC dialogue occasionally feels generic</li>
                <li>Some biome transitions are too abrupt</li>
            </ul>

            <h2>Next Steps</h2>
            <p>We're focusing on:</p>
            <ol>
                <li>Expanding our dungeon template library</li>
                <li>Improving biome blending algorithms</li>
                <li>Integrating LLM for dynamic NPC dialogue</li>
            </ol>

            <h2>The Takeaway</h2>
            <p>Procedural generation is a tool, not a replacement for design. The key is knowing when to be random and when to be deliberate.</p>

            <p><em>Stay tuned for Dev Diary #2 where I'll discuss our NPC simulation systems!</em></p>
        `
    },
    6: {
        id: 6,
        title: "Systemic Design: Making Every Action Matter",
        category: "game-design",
        date: "2024-12-15",
        readTime: 11,
        xpReward: 130,
        content: `
            <h1>Systemic Design: Making Every Action Matter</h1>
            <p><em>December 15, 2024 • 11 minute read</em></p>

            <h2>What is Systemic Design?</h2>
            <p>Systemic design is about creating interconnected game systems that react to player actions in meaningful, often unexpected ways. Think Breath of the Wild's physics interactions or Deus Ex's multiple solution paths.</p>

            <h2>The Core Principles</h2>

            <h3>1. Systems Over Scripts</h3>
            <p>Instead of scripting every interaction, create rules that govern behavior:</p>
            <pre><code>// Bad: Scripted
if player_near_guard and player_has_stolen:
    guard.attack_player()

// Good: Systemic
func _process(delta):
    for witness in visible_witnesses:
        if witness.saw_crime:
            witness.update_opinion(player, -50)
            if witness.is_guard:
                witness.set_target(player)</code></pre>

            <h3>2. Emergent Complexity</h3>
            <p>Simple rules + multiple systems = complex emergent behavior</p>
            <ul>
                <li>Fire spreads to flammable objects</li>
                <li>NPCs flee from fire</li>
                <li>Guards investigate disturbances</li>
                <li>Result: Setting fire creates distraction for theft</li>
            </ul>

            <h3>3. Meaningful Consequences</h3>
            <p>Every action should ripple through connected systems:</p>
            <ul>
                <li>Kill a merchant → Prices rise in region (supply/demand)</li>
                <li>Help a faction → Enemy factions react</li>
                <li>Use magic publicly → Social consequences based on culture</li>
            </ul>

            <h2>Implementing Systemic Design</h2>

            <h3>Step 1: Define Your Systems</h3>
            <p>In The Wayward Realms, our core systems are:</p>
            <ul>
                <li>Reputation (per-faction, per-region)</li>
                <li>Economy (supply/demand, trade routes)</li>
                <li>Politics (faction relationships, power struggles)</li>
                <li>Weather/Environment (affects travel, combat, NPC behavior)</li>
            </ul>

            <h3>Step 2: Create Connections</h3>
            <pre><code>class SystemManager:
    var systems = []

    func notify_event(event_type: String, data: Dictionary):
        for system in systems:
            if system.cares_about(event_type):
                system.process_event(event_type, data)</code></pre>

            <h3>Step 3: Test for Emergence</h3>
            <p>Playtest looking for unexpected interactions. These are features, not bugs!</p>

            <h2>Common Pitfalls</h2>

            <h3>1. Over-Complexity</h3>
            <p>Too many systems = confusion. Start simple, add depth gradually.</p>

            <h3>2. Invisible Systems</h3>
            <p>Players can't engage with what they can't see. Provide feedback:</p>
            <ul>
                <li>UI indicators for system states</li>
                <li>NPC dialogue reflecting systemic changes</li>
                <li>Environmental storytelling</li>
            </ul>

            <h3>3. Unfun Consequences</h3>
            <p>Not all realism is fun. Sometimes you need to "cheat" for gameplay.</p>

            <h2>Case Study: The Merchant Murder</h2>
            <p>A player kills a merchant in a remote village. In a systemic game:</p>
            <ol>
                <li>Witnesses report the crime</li>
                <li>Guards investigate</li>
                <li>Region's economy adjusts (supply decreases)</li>
                <li>Merchant's family seeks revenge</li>
                <li>Faction reputation changes</li>
                <li>Other merchants raise prices (risk premium)</li>
            </ol>
            <p>All from existing systems, no special scripting needed.</p>

            <h2>Conclusion</h2>
            <p>Systemic design creates worlds that feel alive and responsive. It's more work upfront, but the payoff is a game where every playthrough tells a unique story.</p>

            <p>The best game design isn't about creating content—it's about creating systems that generate content.</p>
        `
    }
};

// Gamification state (stored in localStorage)
class ChroniclesGameState {
    constructor() {
        this.loadState();
    }

    loadState() {
        const saved = localStorage.getItem('chronicles_game_state');
        if (saved) {
            const data = JSON.parse(saved);
            this.articlesRead = new Set(data.articlesRead || []);
            this.totalXP = data.totalXP || 0;
            this.lastReadDate = data.lastReadDate || null;
            this.streak = data.streak || 0;
            this.achievements = new Set(data.achievements || []);
        } else {
            this.articlesRead = new Set();
            this.totalXP = 0;
            this.lastReadDate = null;
            this.streak = 0;
            this.achievements = new Set();
        }
        this.updateUI();
    }

    saveState() {
        const data = {
            articlesRead: Array.from(this.articlesRead),
            totalXP: this.totalXP,
            lastReadDate: this.lastReadDate,
            streak: this.streak,
            achievements: Array.from(this.achievements)
        };
        localStorage.setItem('chronicles_game_state', JSON.stringify(data));
    }

    markAsRead(chronicleId) {
        if (!this.articlesRead.has(chronicleId)) {
            this.articlesRead.add(chronicleId);
            const chronicle = chroniclesData[chronicleId];
            if (chronicle) {
                this.addXP(chronicle.xpReward);
                this.updateStreak();
                this.checkAchievements();
                this.saveState();
                this.updateUI();
            }
        }
    }

    addXP(amount) {
        this.totalXP += amount;
        this.checkLevelUp();
    }

    updateStreak() {
        const today = new Date().toDateString();
        if (this.lastReadDate) {
            const lastDate = new Date(this.lastReadDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDate.toDateString() === yesterday.toDateString()) {
                this.streak++;
            } else if (lastDate.toDateString() !== today) {
                this.streak = 1;
            }
        } else {
            this.streak = 1;
        }
        this.lastReadDate = today;
    }

    getRank() {
        if (this.totalXP >= 1000) return "Master Lorekeeper";
        if (this.totalXP >= 750) return "Sage";
        if (this.totalXP >= 500) return "Scholar";
        if (this.totalXP >= 250) return "Apprentice";
        if (this.totalXP >= 100) return "Initiate";
        return "Novice";
    }

    checkLevelUp() {
        const oldRank = this.previousRank || "Novice";
        const newRank = this.getRank();
        if (oldRank !== newRank) {
            this.showAchievement(`🎉 Rank Up! You are now a ${newRank}!`);
        }
        this.previousRank = newRank;
    }

    checkAchievements() {
        // First Article
        if (this.articlesRead.size === 1 && !this.achievements.has('first_scroll')) {
            this.achievements.add('first_scroll');
            this.showAchievement('📜 Achievement Unlocked: First Scroll!');
        }

        // Dedicated Reader (5 articles)
        if (this.articlesRead.size >= 5 && !this.achievements.has('dedicated_reader')) {
            this.achievements.add('dedicated_reader');
            this.showAchievement('📚 Achievement Unlocked: Dedicated Reader!');
            this.addXP(50);
        }

        // Lore Master (all articles)
        if (this.articlesRead.size >= Object.keys(chroniclesData).length && !this.achievements.has('lore_master')) {
            this.achievements.add('lore_master');
            this.showAchievement('🏆 Achievement Unlocked: Lore Master! You\'ve read everything!');
            this.addXP(200);
        }

        // Streak achievements
        if (this.streak >= 7 && !this.achievements.has('weekly_warrior')) {
            this.achievements.add('weekly_warrior');
            this.showAchievement('🔥 Achievement Unlocked: Weekly Warrior! 7-day streak!');
            this.addXP(100);
        }

        this.saveState();
    }

    showAchievement(text) {
        const banner = document.getElementById('achievements-banner');
        const achievementText = document.getElementById('achievement-text');
        if (banner && achievementText) {
            achievementText.textContent = text;
            banner.style.display = 'flex';

            // Play sound if available
            if (window.soundManager) {
                window.soundManager.playRandomPageSound();
            }

            setTimeout(() => {
                banner.style.display = 'none';
            }, 5000);
        }
    }

    updateUI() {
        const articlesReadEl = document.getElementById('articles-read');
        const streakEl = document.getElementById('reading-streak');
        const xpEl = document.getElementById('reader-xp');
        const rankEl = document.getElementById('reader-rank');

        if (articlesReadEl) articlesReadEl.textContent = this.articlesRead.size;
        if (streakEl) streakEl.textContent = this.streak;
        if (xpEl) xpEl.textContent = this.totalXP;
        if (rankEl) rankEl.textContent = this.getRank();

        // Update view counts on cards
        this.articlesRead.forEach(id => {
            const card = document.querySelector(`.chronicle-card[onclick*="${id}"]`);
            if (card) {
                card.style.opacity = '0.85';
                const viewCount = card.querySelector('.view-count');
                if (viewCount) viewCount.textContent = '✓ Read';
            }
        });
    }
}

// Initialize game state
let gameState;

// Category filtering
function initializeChroniclesFiltering() {
    const tomeTabs = document.querySelectorAll('.tome-tab');
    const searchInput = document.getElementById('chronicle-search-input');
    const sortSelect = document.getElementById('sort-select');

    tomeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tomeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter articles
            const category = tab.dataset.category;
            filterChronicles(category);

            // Play sound
            if (window.soundManager) {
                window.soundManager.playRandomPageSound();
            }
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchChronicles(e.target.value);
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortChronicles(e.target.value);
        });
    }
}

function filterChronicles(category) {
    const cards = document.querySelectorAll('.chronicle-card');
    const grid = document.getElementById('chronicles-grid');
    const empty = document.getElementById('chronicles-empty');
    let visibleCount = 0;

    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show empty state if no results
    if (empty) {
        empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function searchChronicles(query) {
    const cards = document.querySelectorAll('.chronicle-card');
    const empty = document.getElementById('chronicles-empty');
    let visibleCount = 0;
    const lowerQuery = query.toLowerCase();

    cards.forEach(card => {
        const title = card.querySelector('.chronicle-title').textContent.toLowerCase();
        const preview = card.querySelector('.chronicle-preview').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.rune-tag')).map(tag => tag.textContent.toLowerCase()).join(' ');

        if (title.includes(lowerQuery) || preview.includes(lowerQuery) || tags.includes(lowerQuery)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (empty) {
        empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function sortChronicles(sortBy) {
    const grid = document.getElementById('chronicles-grid');
    const cards = Array.from(document.querySelectorAll('.chronicle-card'));

    cards.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            case 'oldest':
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            case 'popular':
                return parseInt(b.dataset.reads || 0) - parseInt(a.dataset.reads || 0);
            case 'longest':
                const aTime = parseInt(a.querySelector('.chronicle-duration').textContent);
                const bTime = parseInt(b.querySelector('.chronicle-duration').textContent);
                return bTime - aTime;
            default:
                return 0;
        }
    });

    cards.forEach(card => grid.appendChild(card));
}

// Open full chronicle in modal
function openChronicle(chronicleId) {
    const chronicle = chroniclesData[chronicleId];
    if (!chronicle) return;

    const modal = document.getElementById('chronicle-modal');
    const scrollContent = document.getElementById('scroll-content');

    if (modal && scrollContent) {
        scrollContent.innerHTML = chronicle.content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add class to sheet-content to change background
        const sheetContent = document.querySelector('.sheet-content');
        if (sheetContent) {
            sheetContent.classList.add('chronicle-modal-active');

            // Create animated background overlay
            const backgroundOverlay = document.createElement('div');
            backgroundOverlay.className = 'chronicle-background-overlay';
            sheetContent.appendChild(backgroundOverlay);
        }

        // Mark as read and award XP
        gameState.markAsRead(chronicleId);

        // Initialize reading progress
        initializeReadingProgress();

        // Play sound
        if (window.soundManager) {
            window.soundManager.playRandomPageSound();
        }
    }
}

function closeChronicle() {
    const modal = document.getElementById('chronicle-modal');
    if (modal) {
        // Add exit animation class before removing the main class
        const sheetContent = document.querySelector('.sheet-content');
        if (sheetContent) {
            const backgroundOverlay = sheetContent.querySelector('.chronicle-background-overlay');
            if (backgroundOverlay) {
                backgroundOverlay.classList.add('exiting');

                // Wait for the overlay animation to complete before removing everything
                setTimeout(() => {
                    sheetContent.classList.remove('chronicle-modal-active', 'chronicle-modal-exiting');
                    backgroundOverlay.remove();
                }, 600); // Match the CSS animation duration
            } else {
                // Fallback if no overlay found
                sheetContent.classList.remove('chronicle-modal-active', 'chronicle-modal-exiting');
            }
        }

        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function shareChronicle() {
    if (navigator.share) {
        navigator.share({
            title: document.querySelector('#scroll-content h1').textContent,
            url: window.location.href
        }).catch(() => {});
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        gameState.showAchievement('📋 Link copied to clipboard!');
    }
}

function nextChronicle() {
    // Find next unread chronicle
    const allIds = Object.keys(chroniclesData).map(Number);
    const unread = allIds.filter(id => !gameState.articlesRead.has(id));

    if (unread.length > 0) {
        closeChronicle();
        setTimeout(() => openChronicle(unread[0]), 300);
    } else {
        gameState.showAchievement('🎉 You\'ve read all chronicles! Check back for new ones.');
    }
}

// Reading progress tracker
function initializeReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    const scrollContent = document.getElementById('scroll-content');
    const modal = document.getElementById('chronicle-modal');

    if (modal && progressBar && scrollContent) {
        modal.addEventListener('scroll', () => {
            const scrollTop = modal.scrollTop;
            const scrollHeight = modal.scrollHeight - modal.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';
        });
    }
}

// Export functions globally
window.openChronicle = openChronicle;
window.closeChronicle = closeChronicle;
window.shareChronicle = shareChronicle;
window.nextChronicle = nextChronicle;

// Initialize when section loads
export function initializeChronicles() {
    gameState = new ChroniclesGameState();
    initializeChroniclesFiltering();

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeChronicle();
        }
    });

    // Close modal on background click
    const modal = document.getElementById('chronicle-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeChronicle();
            }
        });
    }
}

