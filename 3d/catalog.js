// 由 build_catalog.py 生成：3D 场景合集，作品页 index.html、对比页 compare/ 与合集播放页 collection/ 共用。
// 场景目录 <id><suffix>/，提示词 prompts/<id><suffix>.txt，缩略图 thumbs/<id><suffix>.jpg；models 只列出已上线的版本。
window.GALLERY_MODELS = {
  "cli": {
    "key": "cli",
    "badge": "CLI 版",
    "short": "CLI",
    "badgeClass": "",
    "note": "Gemini 通过 Antigravity CLI 生成。",
    "suffix": ""
  },
  "web": {
    "key": "web",
    "badge": "Gemini 网页版（4 Argon）",
    "short": "Gemini",
    "badgeClass": "is-web",
    "note": "同样的提示词，在 Gemini 网页上用 4 Argon（思考：高）生成。",
    "suffix": "-web"
  },
  "flash": {
    "key": "flash",
    "badge": "Gemini 网页版（3.8 Flash）",
    "short": "Flash",
    "badgeClass": "is-flash",
    "note": "同样的提示词，在 Gemini 网页上用 3.8 Flash 生成。",
    "suffix": "-flash"
  },
  "deepseek": {
    "key": "deepseek",
    "badge": "DeepSeek V4.1 Flash",
    "short": "DeepSeek",
    "badgeClass": "is-deepseek",
    "note": "同样的提示词，直接调用 ModelScope API 上的 DeepSeek-V4.1-Flash 生成。",
    "suffix": "-deepseek"
  },
  "opus": {
    "key": "opus",
    "badge": "Antigravity · Opus 5.5",
    "short": "Antigravity Opus",
    "badgeClass": "is-opus",
    "note": "同一提示词，在 Antigravity CLI 里改用 Claude Opus 5.5 (High) 生成。",
    "suffix": "-opus"
  },
  "kiro-opus": {
    "key": "kiro-opus",
    "badge": "Opus 5.5",
    "short": "Opus 5.5",
    "badgeClass": "is-kiro",
    "note": "同一提示词，用 Claude Opus 5.5 生成。",
    "suffix": "-kiro-opus"
  },
  "kiro-opus-v1": {
    "key": "kiro-opus-v1",
    "badge": "Opus 5.5（初版）",
    "short": "Opus 5.5 初版",
    "badgeClass": "is-kiro",
    "note": "同一场景的早一版：Claude Opus 5.5 按较早的提示词草稿生成。草稿原文没有保留，这里展示的是定稿提示词。",
    "suffix": "-kiro-opus-v1"
  }
};
window.GALLERY_MODEL_ORDER = ["cli", "web", "flash", "deepseek", "opus", "kiro-opus", "kiro-opus-v1"];
window.GALLERY_CATEGORIES = [
  {
    "id": "classic",
    "emoji": "⭐",
    "title": "经典场景",
    "description": "最早的五个场景：同一提示词分别交给 CLI、网页版、DeepSeek 和 Opus 5.5 生成。",
    "scenes": [
      {
        "id": "pelican",
        "title": "鹈鹕骑自行车",
        "description": "社区经典基准题：鹈鹕踩着脚踏沿环形小路骑行，腿、曲柄、车轮联动。",
        "models": [
          "cli",
          "web",
          "deepseek",
          "opus",
          "kiro-opus"
        ],
        "gradient": "linear-gradient(135deg, #d8efc2 0%, #f7e3a1 55%, #f5c396 100%)",
        "chats": {
          "web": "https://gemini.google.com/app/2bdb9ed47de306b3"
        }
      },
      {
        "id": "midautumn",
        "title": "中秋月夜水榭",
        "description": "满月、金桂花雨、水榭倒影与灯笼暖光，一个静谧的中秋角落。",
        "models": [
          "cli",
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "gradient": "linear-gradient(135deg, #c7d4ec 0%, #e4d5ec 50%, #f6dca6 100%)",
        "chats": {
          "web": "https://gemini.google.com/app/35d65d970fa10510"
        }
      },
      {
        "id": "jet-engine",
        "title": "交互式喷气发动机",
        "description": "风扇与轴旋转，点「分解」看各级部件沿轴线展开，悬停查看作用。",
        "models": [
          "cli",
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "gradient": "linear-gradient(135deg, #cde4ec 0%, #dfeaf2 50%, #f5d9a8 100%)",
        "chats": {
          "web": "https://gemini.google.com/app/f1ba4d863a744b23"
        }
      },
      {
        "id": "temple",
        "title": "天坛祈年殿",
        "description": "三重蓝色琉璃圆顶与汉白玉台基，可一键爆炸 / 重组。",
        "models": [
          "cli",
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "gradient": "linear-gradient(135deg, #bfd8ee 0%, #e5ecf4 52%, #f4d599 100%)",
        "chats": {
          "web": "https://gemini.google.com/app/56fe4c1689886f30"
        }
      },
      {
        "id": "sunset-voxel",
        "title": "永恒日落 · 体素世界",
        "description": "程序生成的方块海岸，一颗低悬海面的橙色落日。",
        "models": [
          "cli",
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "gradient": "linear-gradient(135deg, #f7c59f 0%, #f7dca8 50%, #bfe1d9 100%)",
        "chats": {
          "web": "https://gemini.google.com/app/dad27eee792fcd35"
        }
      }
    ]
  },
  {
    "id": "voxel",
    "emoji": "🧱",
    "title": "体素世界",
    "description": "一块块彩色方块拼出来的小世界。",
    "scenes": [
      {
        "id": "sakura-pagoda",
        "title": "樱花宝塔",
        "description": "樱花庭园里的多层宝塔，彩色体素拼出的春日小景。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/JosephD/status/2090830652799094786",
        "chats": {
          "web": "https://share.gemini.google/qpWll1sMV0KA"
        }
      },
      {
        "id": "soccer",
        "title": "体素足球",
        "description": "方块球员带球连过两名后卫破门，进球后放庆祝粒子。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/Zmthanh/status/2079198084689723560",
        "chats": {
          "web": "https://share.gemini.google/LXNUbQKPXcFF"
        }
      },
      {
        "id": "peashooter",
        "title": "豌豆射手挂件",
        "description": "植物大战僵尸里的豌豆射手体素挂件，可以和它互动。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/veSH0IAc8ycEgGr/status/2096267078550581381",
        "chats": {
          "web": "https://share.gemini.google/mrOJN3hfG2lV"
        }
      },
      {
        "id": "ship-bottle",
        "title": "瓶中船",
        "description": "玻璃瓶里的小船在波浪中航行，整个场景都装在瓶子里。",
        "models": [
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/Bitturing/status/2110716381968879863"
      },
      {
        "id": "kingdom",
        "title": "体素王国",
        "description": "中央是带护城河的城堡，四周是村庄与田野。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/xueyu1125/status/2093936066114032007",
        "chats": {
          "web": "https://share.gemini.google/AqpYYt80fIRr"
        }
      },
      {
        "id": "jp-garden",
        "title": "日式庭园 · 飞龙",
        "description": "宝塔、小村民和盘旋的飞龙，还有可以互动的小细节。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/marcthecreatorr/status/2103486103831339269",
        "chats": {
          "web": "https://share.gemini.google/g0m6wAno0hgN"
        }
      },
      {
        "id": "steam-train",
        "title": "夕阳蒸汽火车",
        "description": "体素蒸汽火车在日落时分穿过河谷。",
        "models": [
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/genuenci/status/2112462606736785804"
      },
      {
        "id": "f1-car",
        "title": "体素 F1 赛车",
        "description": "体素风格的梅赛德斯 AMG F1 赛车。",
        "models": [
          "web",
          "flash",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/HarshithLucky3/status/2110048102321365205"
      }
    ]
  },
  {
    "id": "machines",
    "emoji": "⚙️",
    "title": "机械与载具",
    "description": "会动、能拆、可以操控的机器。",
    "scenes": [
      {
        "id": "optimus",
        "title": "擎天柱变形",
        "description": "按 T 在卡车头和人形之间变形，WASD 操控行驶和行走。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/CyberSp14440918/status/2049066100361666888",
        "chats": {
          "web": "https://share.gemini.google/v8X3RCKO6abp"
        }
      },
      {
        "id": "lego-ferrari",
        "title": "法拉利拆解教学",
        "description": "类似 JigSpace 的交互教学展示，拆开看法拉利的核心部件。",
        "models": [
          "web",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/Lonely__MH/status/2088248656998851063",
        "chats": {
          "web": "https://share.gemini.google/evjqvt5gQ4tF"
        }
      },
      {
        "id": "skyraider",
        "title": "A-1H 天袭者",
        "description": "道格拉斯 A-1H 天袭者螺旋桨攻击机。",
        "models": [
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/BuildFastWithAI/status/2103152898708582551"
      },
      {
        "id": "inline-four",
        "title": "直列四缸发动机",
        "description": "活塞、曲轴、凸轮联动，按点火顺序点火，可一键分解。",
        "models": [
          "web",
          "flash",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/afeiNick/status/2106923394490863794"
      },
      {
        "id": "raptor",
        "title": "猛禽发动机",
        "description": "SpaceX 猛禽（Raptor）火箭发动机，白色背景。",
        "models": [
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/LinearUncle/status/2091127601314308541"
      },
      {
        "id": "steam-engine",
        "title": "蒸汽机原型",
        "description": "一台能运转的蒸汽机原型。",
        "models": [
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/vikktorrrre/status/2091965269048475659"
      },
      {
        "id": "starship",
        "title": "星舰展示",
        "description": "SpaceX 星舰的 3D 展示。",
        "models": [
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/ai_for_success/status/2090047812423790872"
      }
    ]
  },
  {
    "id": "space",
    "emoji": "🪐",
    "title": "星球与宇宙",
    "description": "地球、黑洞、浮空岛和一颗热闹的卡通星球。",
    "scenes": [
      {
        "id": "earth",
        "title": "精细地球",
        "description": "一颗尽量精细好看的 3D 地球。",
        "models": [
          "web",
          "flash",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/LongXiao4082/status/2079472589114834995"
      },
      {
        "id": "black-hole",
        "title": "黑洞引力透镜",
        "description": "卡冈图雅式黑洞：引力透镜、吸积盘和环绕的等离子体。",
        "models": [
          "web",
          "flash",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/ItsmeAjayKV/status/2064432956505255939",
        "chats": {
          "web": "https://share.gemini.google/Bz4TuXDoIcNy"
        }
      },
      {
        "id": "floating-islands",
        "title": "浮空岛世界",
        "description": "黄金时刻的浮空岛、瀑布、遗迹与飞艇，WASD 自由飞行。",
        "models": [
          "web",
          "flash",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/antpalkin/status/2084302112662417656"
      },
      {
        "id": "cartoon-planet",
        "title": "卡通星球",
        "description": "漫画风小星球，云、山、城市，车和飞机在上面跑。",
        "models": [
          "web",
          "flash",
          "deepseek",
          "kiro-opus"
        ],
        "source": "https://x.com/huxlab/status/2102684995571859707",
        "chats": {
          "web": "https://share.gemini.google/8KATtBYvsU92"
        }
      }
    ]
  },
  {
    "id": "opus-new",
    "emoji": "🎬",
    "title": "新场景 · Opus 5.5",
    "description": "两条新写的长提示词：一镜到底的云海列车和像素风冰球场，主要由 Claude Opus 5.5 生成，云海列车另有 DeepSeek 版。",
    "scenes": [
      {
        "id": "sky-arc-train",
        "title": "云海之上 · 星轨蒸汽列车",
        "description": "蒸汽列车沿 C 形圆弧轨道驶过云海上的维多利亚玻璃车站，25 秒一镜到底循环运镜，可拖动自由观察。",
        "models": [
          "deepseek",
          "kiro-opus",
          "kiro-opus-v1"
        ],
        "gradient": "linear-gradient(135deg, #1d2a52 0%, #3b4f86 50%, #f2b27a 100%)"
      },
      {
        "id": "ice-rink",
        "title": "像素冰球场",
        "description": "浮空的户外冰场，以像素画风格实时渲染：2 对 2 冰球比赛、浇冰车整冰、昼夜与飘雪切换。",
        "models": [
          "kiro-opus"
        ],
        "gradient": "linear-gradient(135deg, #e6f0fa 0%, #bcd6ee 50%, #f3c9c0 100%)"
      }
    ]
  }
];
