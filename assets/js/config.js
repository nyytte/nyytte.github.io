// Single source of truth for all page content.
// Edit content HERE — not in index.html or the render code.
export const config = {
  // Personal Information
  personal: {
    name: "Nyte",
    roleAccent: "Roblox Lua Developer",
    roleHighlight: "",
    description: "I build clean, fast Roblox systems, from combat and frameworks to datastores and UI, made to scale and last.",
    yearsScripting: "3+",
    gamesDeveloped: "10+",
    bugsFixed: "∞",
    discordUsername: "_nyte._",
    discordUserId: "1403162458134155356",
    robloxName: "nyytte",
    robloxLink: "https://www.roblox.com/users/9134288901/profile",
    xUsername: "_nyyte_",
    xLink: "https://x.com/_nyyte_",
    isOpenToWork: true,
    statusText: "Available",
    specialty: "Systems & OOP",
    stack: "Luau · Roblox",
    country: "Spain",
    experience: "3+ years",
    // Words cycled by the hero typewriter line.
    heroTyped: [
      "combat systems",
      "scalable frameworks",
      "data systems",
      "UI with React-Luau",
      "anti-exploit logic",
      "custom mechanics",
      "movement systems",
      "funny little scripts",
      "a shark and a fish"
    ],
    // Intro-as-code shown in the About section (highlighted at runtime).
    aboutCode: `--!strict
-- Nyte introduction
local Nyte = {
	Name = "Nyte",
	Age = 18,
	Country = "Spain",
	Role = "Roblox Lua Developer",
	Experience = "3+ years",
	Focus = { "Systems", "Performance", "Architecture" },
	Tools = { "Rojo", "Wally", "Git"},
}

function Nyte:OpenToWork(): boolean
    return true -- always up for a solid project
end

return Nyte`
  },

  // About Section text paragraphs
  aboutParagraphs: [
    "Hey, I'm Nyte! I'm 18 and from Spain, and I've been scripting Roblox games for around 3 years now. I mostly build the systems that make a game actually work: combat, movement, data, UI, all that.",
    "I really care about code that stays clean and doesn't fall apart three months later. I work with Rojo, Wally and strict Luau typing, so bugs get caught early and the project stays easy to touch even once it gets big.",
    "I'm happy taking something from a rough idea all the way to launch. If you've got a game and need someone reliable to build its core systems, just reach out. I'm always down for a good project."
  ],

  // Skills (no fake mastery %, just what I work with)
  skills: [
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
      name: "Luau",
      description: "Comfortable building complex systems with metatables and type-safe patterns, keeping code clean and easy to work with."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
      name: "Performance",
      description: "Keeping gameplay smooth with optimized client visuals, efficient server logic, and systems that scale well without losing performance."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
      name: "Scalable Architecture",
      description: "Modular, reusable systems designed for multi-project use, with flexible controllers, services, and configurations."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><polyline points="7 9 10 12 7 15"></polyline><line x1="13" y1="15" x2="17" y2="15"></line></svg>`,
      name: "Rojo, Git, Wally",
      description: "Well structured external workflow with Rojo, Wally, and Git, focused on clean organization and scalability."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"></path><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"></path></svg>`,
      name: "React-Luau & Charm",
      description: "Declarative UI with React-Luau, Charm for state management, and Ripple for smooth animations."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><line x1="12" y1="12" x2="12" y2="8"></line></svg>`,
      name: "Networking",
      description: "Advanced use of Networker wrapper for secure client-server communication, server validation, and reliable remote calls"
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
      name: "Player Data Systems",
      description: "Player data handled with ProfileStore, session locking, reliable save/load patterns, and custom utility functions"
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line></svg>`,
      name: "Physics & Combat",
      description: "High-performance combat and physics: hitboxes, raycasting, server authoritative logic, and custom systems"
    }
  ],

  // Commissions
  commissions: [
    {
      status: "finished",
      title: "Swing System",
      description: "A fast paced, spiderman inspired swinging system with momentum based movement and bhop mechanics.",
      details: "The system focuses on speed and control, letting you build momentum and keep it as you move. You can chain bhops, adjust your movement in the air, and use the grapple in different ways to stay in motion without losing speed. Built in ~2h.",
      links: [
        { text: "Showcase swinging", url: "https://streamable.com/lh0388", icon: "🏹" },
        { text: "Showcase bhop", url: "https://streamable.com/unpltw", icon: "🐇" }
      ]
    },
    {
      status: "finished",
      title: "Fuse System",
      description: "A high-fidelity character merging system featuring algorithmic DNA inheritance, cinematic reveal sequences, and a reactive UI architecture.",
      details: "the DNA Fusion System handles complex character merging through custom inheritance algorithms. It features a complete cinematic reveal phase with dynamic camera framing and environmental polish. The UI is built using React-Luau for modularity, Charm for state management, and Ripple for high-performance animations, ensuring an immersive user experience.",
      links: [
        { text: "Showcase", url: "https://streamable.com/ryhzxo", icon: "🧬" }
      ]
    }
  ],

  // Projects
  projects: [
    {
      tags: [
        { name: "Game", class: "tag-sys" },
        { name: "Luau", class: "tag-lua" }
      ],
      status: "wip", // "wip" or "finished"
      title: "Freeze Tag",
      description: "A tactical PvP round-based Ice Tag game featuring momentum-driven movement, strategic sword combat, and a team objective system centered on freezing and thawing opponents.",
      details: "Freeze Tag is my current long-term project. It is a fast-paced PvP Ice Tag game where teams compete to immobilize opponents while saving their own. Sword strikes freeze enemies into solid ice blocks, requiring teammates to quickly use a melter to thaw them before a death timer runs out. Success depends on mastering momentum-based movement, skillfully using throwables like grenades, and precise sword combat, rewarding players who can navigate the arena effectively to defeat the opposing team or secure key objectives.",
      links: [
        { text: "Throwables Showcase 1", url: "https://streamable.com/j7plkf", icon: "💣" },
        { text: "Throwables Showcase 2", url: "https://streamable.com/9sf6it", icon: "💨" },
        { text: "Freezing/Melting Showcase", url: "https://streamable.com/ja9pu8", icon: "🧊" },
        { text: "Control point showcase", url: "https://streamable.com/1d9pbe", icon: "🎯" }
      ]
    },
    {
      tags: [
        { name: "Framework", class: "tag-oop" },
        { name: "Open Source", class: "tag-open" }
      ],
      status: "finished",
      title: "ControllerManager",
      description: "A three-phase module loader for character controllers with automatic lifecycle management, parallel loading, and built-in retry logic.",
      details: "The ControllerManager is a modular system that organizes the game controllers and services. It follows a three-phase lifecycle: Construction, Initialization, and Start, loading modules in parallel using Promise package while safely handling dependencies between systems. It includes built-in cleanup using Janitor and manages both character-specific and persistent player controllers, providing a simple and reliable framework for gameplay logic.",
      files: [
        { name: "src/init.luau",                    path: "assets/code/controllermanager/src/init.luau" },
        { name: "src/ControllerManagerServer.luau", path: "assets/code/controllermanager/src/ControllerManagerServer.luau" },
        { name: "src/ControllerManagerClient.luau", path: "assets/code/controllermanager/src/ControllerManagerClient.luau" }
      ],
      links: [
        { text: "Source Code", url: "https://github.com/YkXero/controllermanager", icon: "🔗" },
        { text: "Wally Package", url: "https://wally.run/package/ykxero/controllermanager", icon: "📦" }
      ]
    },
    {
      status: "wip",
      title: "Untitled RNG Unboxing Game",
      description: "Server-authoritative unboxing with client prediction and anti-exploit safeguards.",
      details: "A deterministic RNG system where the server controls every roll while the client predicts the result for instant visual feedback. Each case has its own luck tracking, so players can't manipulate odds between different cases. DataStore persistence is used to prevent exploits like seed farming (rerolling by rejoining). Designed to be highly scalable and easy to customize for different case types and drop systems. Includes a React-based UI with custom rarity effects and smooth animations. Currently my short-term own personal project.",
      files: [
        { name: "RNGService.luau",                  path: "assets/code/RNG/RNGService.luau" },
        { name: "RNG/RNGController.luau",            path: "assets/code/RNG/RNG/RNGController.luau" },
        { name: "RNG/Helpers/RNGStream.luau",        path: "assets/code/RNG/RNG/Helpers/RNGStream.luau" },
        { name: "RNG/Helpers/LootTable.luau",        path: "assets/code/RNG/RNG/Helpers/LootTable.luau" },
        { name: "RNG/Cases/CaseConfig.luau",         path: "assets/code/RNG/RNG/Cases/CaseConfig.luau" },
        { name: "RNG/Cases/SellValues.luau",         path: "assets/code/RNG/RNG/Cases/SellValues.luau" },
        { name: "RNG/Cases/List/BasicCase.luau",     path: "assets/code/RNG/RNG/Cases/List/BasicCase.luau" },
        { name: "RNG/Cases/List/AdvancedCase.luau",  path: "assets/code/RNG/RNG/Cases/List/AdvancedCase.luau" },
        { name: "RNG/Constants/RNGConstants.luau",   path: "assets/code/RNG/RNG/Constants/RNGConstants.luau" },
        { name: "Unboxing/ReelStrip.luau",           path: "assets/code/RNG/Unboxing/ReelStrip.luau" },
        { name: "Unboxing/CaseItem.luau",            path: "assets/code/RNG/Unboxing/CaseItem.luau" },
        { name: "Unboxing/UnboxButton.luau",         path: "assets/code/RNG/Unboxing/UnboxButton.luau" },
        { name: "Unboxing/UnboxingResultDisplay.luau", path: "assets/code/RNG/Unboxing/UnboxingResultDisplay.luau" }
      ],
      links: [
        { text: "Showcase", url: "https://streamable.com/va8qt1", icon: "🎲" }
      ]
    },
    {
      status: "wip",
      title: "A quiet place.",
      description: "Infinite procedural generation terrain world powered by Parallel Luau and wedge based geometry",
      details: "In this game, you can explore an endless landscape generated entirely in real time. You can traverse diverse biomes through a world built completely on triangular procedural generation, no 3D models were used in its creation it is pure code. As you travel, the world seamlessly constructs itself ahead of you, offering a inmersive journey where there are no boundaries and the horizon never ends. This project focuses on the aesthetic beauty of procedural systems and the serenity of discovery.",
      links: [
        { text: "Showcase", url: "https://streamable.com/d0oyym", icon: "🌍" }
      ]
    },
  ],

  // UI Settings
  ui: {
    feedbackScrollSpeed: 1.2
  },

  feedback: [
    {
      name: "mashdee",
      avatarUrl: "https://cdn.discordapp.com/avatars/934568920285847552/f1fd5e2a1fa7ec0fe11b71b4e96c2d97.png?size=512",
      role: "Game Owner",
      text: "I spent a lot of time working with Nyte and he is always great with communication and delivers really good code.",
      rating: 5
    },
    {
      name: "pumpkinjajaja",
      avatarUrl: "https://cdn.discordapp.com/avatars/741374651288256583/2d28c2cd87403780644eab30afc0eeed.png?size=512",
      role: "Developer",
      text: "Fast working, super active and open for feedback and improvements, also really nice!",
      rating: 5
    },
    {
      name: "that1kull",
      avatarUrl: "https://cdn.discordapp.com/avatars/1110691943559737444/0e5d69bb7720602efd97893065feb84f.png?size=512",
      role: "Developer",
      text: "Quick to get things done, open to ideas, and really easy to work with.",
      rating: 5
    },
    {
      name: "Nemery",
      avatarUrl: "https://cdn.discordapp.com/avatars/320931449056526337/f8abd01d8567032f35aae62d698e27c6.png?size=512",
      role: "Developer",
      text: "Very patient and extremely fast at scripting. He gives very frequent communication and gives consistent progress updates when he finishes a task. He offers reasonable prices and produces high-quality work.",
      rating: 5
    }
  ]
};
