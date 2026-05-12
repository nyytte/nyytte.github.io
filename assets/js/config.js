window.portfolioConfig = {
  // Personal Information
  personal: {
    name: "Nyte",
    roleAccent: "Roblox Lua Developer",
    roleHighlight: "",
    description: "I build clean, optimized Roblox <code>systems</code>, from <code>frameworks</code> to <code>complex systems</code>, <code>UI scripting</code>, <code>datastores</code>, and more.",
    yearsScripting: "3+",
    gamesDeveloped: "2+",
    bugsFixed: "∞",
    discordUsername: "_nyte._",
    discordUserId: "1403162458134155356",
    robloxName: "espxero",
    robloxLink: "https://www.roblox.com/users/721451314/profile",
    xUsername: "_nyyte_",
    xLink: "https://x.com/_nyyte_",
    isOpenToWork: true,
    statusText: "Available",
    specialty: "Systems",
    stack: "Luau · Roblox"
  },

  // About Section text paragraphs
  aboutParagraphs: [
    "Hi! I'm Nyte, an 18-year-old Roblox developer from Spain with 3 years of experience creating maintainable, high-performance code. I specialize in building robust systems that last for a game's entire lifecycle, from simple scripts to complex mechanics tailored to each project.",
    "I work with professional tools like Rojo, strict Luau type-checking, and modular development patterns to catch bugs early and keep code clean. From server-authoritative combat loops to scalable game state systems, I focus on efficiency, reliability, and long-term maintainability.",
    "I can take a project from concept to launch, designing advanced systems using metatables, modular architecture, and large-scale code organization. If you need a developer to create solid, high-performance Roblox systems, I’m ready to help."
  ],

  // Skills
  skills: [
    {
      icon: "assets/img/skills/luau.svg",
      name: "Luau",
      description: "Comfortable building complex systems with metatables and type-safe patterns, keeping code clean and easy to work with.",
      mastery: 95
    },
    {
      icon: "assets/img/skills/performance.svg",
      name: "Performance",
      description: "Keeping gameplay smooth with optimized client visuals, efficient server logic, and systems that scale well without losing performance.",
      mastery: 99
    },
    {
      icon: "assets/img/skills/architecture.svg",
      name: "Scalable Architecture",
      description: "Modular, reusable systems designed for multi-project use, with flexible controllers, services, and configurations.",
      mastery: 95
    },
    {
      icon: "assets/img/skills/tools.svg",
      name: "Rojo, Git, Wally",
      description: "Well structured external workflow with Rojo, Wally, and Git, focused on clean organization and scalability.",
      mastery: 93
    },
    {
      icon: "assets/img/skills/react.svg",
      name: "React-Luau & Charm",
      description: "Declarative UI with React-Luau, Charm for state management, and Ripple for smooth animations.",
      mastery: 85
    },
    {
      icon: "assets/img/skills/networking.svg",
      name: "Networking",
      description: "Advanced use of Networker wrapper for secure client-server communication, server validation, and reliable remote calls",
      mastery: 95
    },
    {
      icon: "assets/img/skills/data.svg",
      name: "Player Data Systems",
      description: "Player data handled with ProfileStore, session locking, reliable save/load patterns, and custom utility functions",
      mastery: 94
    },
    {
      icon: "assets/img/skills/combat.svg",
      name: "Physics & Combat",
      description: "High-performance combat and physics: hitboxes, raycasting, server authoritative logic, and custom systems",
      mastery: 95
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
    },


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
      description: "A two-phase module loader for character controllers with automatic lifecycle management, parallel loading, and built-in retry logic.",
      details: "The ControllerManager is a modular system that organizes the game controllers and services. It follows a three-phase lifecycle: Construction, Initialization, and Start, loading modules in parallel using Promise package while safely handling dependencies between systems. It includes built-in cleanup using Janitor and manages both character-specific and persistent player controllers, providing a simple and reliable framework for gameplay logic.",
      links: [
        { text: "Source Code", url: "https://github.com/YkXero/controllermanager", icon: "🔗" },
        { text: "Wally Package", url: "https://wally.run/package/ykxero/controllermanager", icon: "📦" }
      ]
    },
    {
      status: "wip",
      title: "Untitled RNG Unboxing Game",
      description: "Server-authoritative unboxing with client prediction and anti-exploit safeguards.",
      details: "A deterministic RNG system where the server controls every roll while the client predicts the result for instant visual feedback. Each case has its own luck tracking, so players can’t manipulate odds between different cases. DataStore persistence is used to prevent exploits like seed farming (rerolling by rejoining). Designed to be highly scalable and easy to customize for different case types and drop systems. Includes a React-based UI with custom rarity effects and smooth animations. Currently my short-term own personal project.",
      links: [
        { text: "Showcase", url: "https://streamable.com/k9nxwm", icon: "🎲" }
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
    {
      tags: [
        { name: "Available", class: "tag-sys" },
        { name: "Commissions Open", class: "tag-lua" }
      ],
      title: "Your Project Here",
      description: "I'm currently taking on new commissions. Let's build your next game core systems together!",
      details: "I'm currently available for short-term commissions. If your project needs robust, scalable Luau code, feel free to reach out and discuss what you'd like built!",
      links: [
        { text: "Contact Me", url: "#contact", icon: "💬" }
      ]
    }
  ],


  // UI Settings
  ui: {
    feedbackScrollSpeed: 1.2
  },

  feedback: [
    // Example:
    // {
    //   name: "Username",              // Required - displayed name
    //   avatarUrl: "https://...",       // Optional - avatar image URL (shows initial if empty)
    //   role: "Game Owner",
    //   text: "Great work!",
    //   rating: 5
    // }
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
    },
  ],

};
