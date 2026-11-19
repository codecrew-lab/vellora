package com.vellora.app.data

import com.vellora.app.model.Book
import com.vellora.app.model.BookCategory

object BookRepository {

    val sampleBooks: List<Book> = listOf(
        Book(
            id = "bk_001",
            title = "The Golden Archives of Eldoria",
            author = "Aurelius Vance",
            category = BookCategory.FANTASY,
            description = "An ancient realm where forgotten spells lie buried beneath marble library vaults. Follow Kaelen as he uncovers the lost key to the celestial gates.",
            coverColorHex = "#8B0000",
            isFeatured = true,
            pages = listOf(
                """Chapter I: The Whispering Library
                
In the high towers of Eldoria, where silver mist hangs like spun silk between ancient pillars, the Great Archives stood silent. Thousands of leather-bound folios slept upon cedar shelves, waiting for the one hand capable of waking their slumbering runes.

Young scribe Kaelen ran his fingers across the gilded spines. The ink on these pages had been dried for three millennia, yet tonight, a soft emerald resonance hummed beneath his palms. It was the Codex of Dawn, a tome spoken of only in whispered myths by candlelit hearths.""",

                """Chapter I (Continued): The Sealed Threshold

The lock upon the Codex bore three interlocking brass rings, inscribed with celestial constellations. As Kaelen held his breath and turned the second ring, a subtle mechanism clicked beneath the ironwood casing.

"Some doors, once unlocked, can never be closed," whispered Master Theron, stepping out from the shadows of the archway. His eyes reflected the faint starlight creeping through the stained glass dome above. Kaelen looked back at the glowing parchment with unwavering resolve.""",

                """Chapter II: The Celestial Map

Beyond the third ring lay a star map inked in iridescent lapis lazuli. It detailed forgotten sea routes and skyways leading to the Floating Citadel of Astrum.

"If the legends hold true," Kaelen noted, tracing the glowing celestial lines with his ink-stained quill, "the Heart of the Stars resides high above the Tempest Ridge. We leave at first light before the Shadow Sentinel notices the missing key." """
            )
        ),
        Book(
            id = "bk_002",
            title = "Echoes of Classical Antiquity",
            author = "Helena Rostova",
            category = BookCategory.CLASSICS,
            description = "A breathtaking journey through ancient Mediterranean philosophy, grand amphitheaters, and timeless literary discourse.",
            coverColorHex = "#3E2723",
            isFeatured = false,
            pages = listOf(
                """Book I: The Marble Agora

Beneath the warm Aegean sun, the marble colonnades of Athens echoed with debate. Philosophers clad in linen robes gathered beneath the shade of olive groves, searching for truth in a world governed by impermanence.

Socrates stood at the center of the gathering, his quiet demeanor commanding the undivided attention of statesmen and scholars alike. "Knowledge," he posited, "is not the accumulation of answers, but the relentless courage to ask." """,

                """Book I (Continued): The Stoic Fortress

Across the sea in Rome, Emperor Marcus Aurelius sat in his campaign tent by the frozen Danube, penning his private meditations. In the quiet hours before dawn, he reminded himself of the transient nature of earthly triumph.

"You have power over your mind - not outside events. Realize this, and you will find indestructible strength." The ink dried upon the vellum, preserving wisdom that would echo across centuries."""
            )
        ),
        Book(
            id = "bk_003",
            title = "Midnight at Blackwood Manor",
            author = "Julian Thorne",
            category = BookCategory.MYSTERY,
            description = "When a Victorian clock strikes thirteen, Inspector Vance steps into a mansion where every painting hides a secret door.",
            coverColorHex = "#1A237E",
            isFeatured = false,
            pages = listOf(
                """Prologue: The Thirteenth Chime

Rain hammered relentlessly against the tall diamond-pane windows of Blackwood Manor. Inside the grand study, the grandfather clock struck thirteen echoing beats.

Inspector Vance adjusted his damp tweed coat and looked down at the mahogany writing desk. A single silver key lay resting atop an unsealed envelope marked with a crest in red sealing wax: 'To the one who dares to open.' """,

                """Chapter I: The Hidden Passage

Behind the heavy velvet drapery in the library, Vance discovered a subtle latch hidden in the carved oak wainscoting. With a low groan of ancient iron, the bookcase swung inward, revealing a spiral staircase leading into darkness.

His oil lamp cast dancing shadows upon stone walls damp with age. Step by step, the mystery of Lord Blackwood's vanishing act began to unravel."""
            )
        ),
        Book(
            id = "bk_004",
            title = "Meditations on Mind & Ether",
            author = "Dr. Nathaniel Croft",
            category = BookCategory.PHILOSOPHY,
            description = "A deep exploration into consciousness, perception, time, and the quiet beauty of human thought.",
            coverColorHex = "#2E7D32",
            isFeatured = false,
            pages = listOf(
                """Section 1: The Sanctuary of Silence

In an age dominated by noise, silence has become the rarest sanctuary. Consciousness is not merely a reactor to outer stimuli, but an active weaver of meaning, sculpting reality out of raw perception.

To sit quietly with one's thoughts without seeking distraction is the foundational pillar of inner freedom. Here, in the unhurried quiet, the soul learns to listen.""",

                """Section 2: The Flow of Time

Time is not a rigid line measuring seconds, but an organic river flowing through memory and anticipation. We live perpetually in the knife-edge present—where memory colors our step and hope illuminates our path ahead."""
            )
        ),
        Book(
            id = "bk_005",
            title = "Chronicles of the Silicon Nebula",
            author = "Lyra Vance-Kovacs",
            category = BookCategory.SCI_FI,
            description = "Deep in sector 9, synthetic humans and organic wanderers chart unexplored quantum stargates.",
            coverColorHex = "#4A148C",
            isFeatured = false,
            pages = listOf(
                """Cycle 01: The Quantum Horizon

The starship 'Vellora Prime' drifted silently along the event horizon of Sector 9. Synthetic pilot Unit-7 monitored the sub-space telemetry as shimmering neon energy arcs pulsed across the obsidian hull.

"Bridge to navigation," Unit-7 radioed. "The quantum gate is stabilizing. Preparing warp drive ignition in T-minus ten seconds." """,

                """Cycle 02: Neon Dawn

Beyond the warp jump lay the twin suns of Astraea. Cities suspended in zero-gravity spheres glimmered like diamonds against the violet void. Here, human ingenuity and artificial consciousness harmonized in perpetual creation."""
            )
        ),
        Book(
            id = "bk_006",
            title = "Verses under Autumn Stars",
            author = "Clara Bennett",
            category = BookCategory.POETRY,
            description = "A collection of lyrical poetry celebrating autumn leaves, starlit nights, and quiet romantic reflection.",
            coverColorHex = "#D84315",
            isFeatured = false,
            pages = listOf(
                """Canto I: Autumn Leaves

Golden leaves drift upon amber wind,
Whispering tales of summer's peaceful end.
Beneath the velvet arch of twilight sky,
The gentle night sings a soft lullaby.

Hold fast to moments rendered golden bright,
Before the dawn dissolves the quiet night.""",

                """Canto II: The Starlit Path

A quiet lane bathed in silvery glow,
Where quiet waters smoothly flow.
Each star a lamp lit by forgotten hand,
To guide lost dreamers across the land."""
            )
        )
    )
}
