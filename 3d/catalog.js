// 由 build_catalog.py 生成：第二批 3D 场景（三个合集），作品页 index.html 与合集播放页 collection/ 共用。
// 场景目录 <id>-<model>/，提示词 prompts/<id>-<model>.txt，缩略图 thumbs/<id>-<model>.jpg；models 只列出已上线的版本。
window.GALLERY_MODELS = {
  "web": {
    "key": "web",
    "badge": "Gemini 网页版（4 Argon）",
    "short": "Gemini",
    "badgeClass": "is-web",
    "note": "同样的提示词，在 Gemini 网页上用 4 Argon（思考：高）生成。"
  },
  "flash": {
    "key": "flash",
    "badge": "Gemini 网页版（3.8 Flash）",
    "short": "Flash",
    "badgeClass": "is-flash",
    "note": "同样的提示词，在 Gemini 网页上用 3.8 Flash 生成。"
  },
  "deepseek": {
    "key": "deepseek",
    "badge": "DeepSeek V4.1 Flash",
    "short": "DeepSeek",
    "badgeClass": "is-deepseek",
    "note": "同样的提示词，直接调用 ModelScope API 上的 DeepSeek-V4.1-Flash 生成。"
  }
};
window.GALLERY_MODEL_ORDER = ["web", "flash", "deepseek"];
window.GALLERY_CATEGORIES = [
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
        "source": "https://x.com/JosephD/status/2090830652799094786",
        "models": [
          "web",
          "deepseek"
        ],
        "chats": {
          "web": "https://share.gemini.google/qpWll1sMV0KA"
        }
      },
      {
        "id": "soccer",
        "title": "体素足球",
        "description": "方块球员带球连过两名后卫破门，进球后放庆祝粒子。",
        "source": "https://x.com/Zmthanh/status/2079198084689723560",
        "models": [
          "web",
          "deepseek"
        ],
        "chats": {
          "web": "https://share.gemini.google/LXNUbQKPXcFF"
        }
      },
      {
        "id": "peashooter",
        "title": "豌豆射手挂件",
        "description": "植物大战僵尸里的豌豆射手体素挂件，可以和它互动。",
        "source": "https://x.com/veSH0IAc8ycEgGr/status/2096267078550581381",
        "models": [
          "web",
          "deepseek"
        ],
        "chats": {
          "web": "https://share.gemini.google/mrOJN3hfG2lV"
        }
      },
      {
        "id": "ship-bottle",
        "title": "瓶中船",
        "description": "玻璃瓶里的小船在波浪中航行，整个场景都装在瓶子里。",
        "source": "https://x.com/Bitturing/status/2110716381968879863",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "kingdom",
        "title": "体素王国",
        "description": "中央是带护城河的城堡，四周是村庄与田野。",
        "source": "https://x.com/xueyu1125/status/2093936066114032007",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "jp-garden",
        "title": "日式庭园 · 飞龙",
        "description": "宝塔、小村民和盘旋的飞龙，还有可以互动的小细节。",
        "source": "https://x.com/marcthecreatorr/status/2103486103831339269",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "steam-train",
        "title": "夕阳蒸汽火车",
        "description": "体素蒸汽火车在日落时分穿过河谷。",
        "source": "https://x.com/genuenci/status/2112462606736785804",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "f1-car",
        "title": "体素 F1 赛车",
        "description": "体素风格的梅赛德斯 AMG F1 赛车。",
        "source": "https://x.com/HarshithLucky3/status/2110048102321365205",
        "models": [
          "deepseek"
        ]
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
        "source": "https://x.com/CyberSp14440918/status/2049066100361666888",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "lego-ferrari",
        "title": "法拉利拆解教学",
        "description": "类似 JigSpace 的交互教学展示，拆开看法拉利的核心部件。",
        "source": "https://x.com/Lonely__MH/status/2088248656998851063",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "skyraider",
        "title": "A-1H 天袭者",
        "description": "道格拉斯 A-1H 天袭者螺旋桨攻击机。",
        "source": "https://x.com/BuildFastWithAI/status/2103152898708582551",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "inline-four",
        "title": "直列四缸发动机",
        "description": "活塞、曲轴、凸轮联动，按点火顺序点火，可一键分解。",
        "source": "https://x.com/afeiNick/status/2106923394490863794",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "raptor",
        "title": "猛禽发动机",
        "description": "SpaceX 猛禽（Raptor）火箭发动机，白色背景。",
        "source": "https://x.com/LinearUncle/status/2091127601314308541",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "steam-engine",
        "title": "蒸汽机原型",
        "description": "一台能运转的蒸汽机原型。",
        "source": "https://x.com/vikktorrrre/status/2091965269048475659",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "starship",
        "title": "星舰展示",
        "description": "SpaceX 星舰的 3D 展示。",
        "source": "https://x.com/ai_for_success/status/2090047812423790872",
        "models": [
          "deepseek"
        ]
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
        "source": "https://x.com/LongXiao4082/status/2079472589114834995",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "black-hole",
        "title": "黑洞引力透镜",
        "description": "卡冈图雅式黑洞：引力透镜、吸积盘和环绕的等离子体。",
        "source": "https://x.com/ItsmeAjayKV/status/2064432956505255939",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "floating-islands",
        "title": "浮空岛世界",
        "description": "黄金时刻的浮空岛、瀑布、遗迹与飞艇，WASD 自由飞行。",
        "source": "https://x.com/antpalkin/status/2084302112662417656",
        "models": [
          "deepseek"
        ]
      },
      {
        "id": "cartoon-planet",
        "title": "卡通星球",
        "description": "漫画风小星球，云、山、城市，车和飞机在上面跑。",
        "source": "https://x.com/huxlab/status/2102684995571859707",
        "models": [
          "deepseek"
        ]
      }
    ]
  }
];
