/* Generated from the Zuzalu Dossier (research file, Sep 2026). Photos belong to the credited authors. */
export interface DossierPhoto { src: string; caption: string; credit: string | null; hero: boolean }
export interface DossierVideo { href: string; thumb: string; title: string }
export interface DossierChapter { id: string; num: string; title: string; place: string; dates: string; lede: string; stats: { value: string; label: string }[]; photos: DossierPhoto[]; videos: DossierVideo[] }
export interface TimelineSeg { t: string; href?: string }
export interface TimelineRow { kind: string; year: string | null; when: string; what: TimelineSeg[] }

export const DOSSIER_EMBLEM = "/zuzalu/00-d6c5c5.jpg";
export const DOSSIER_CHAPTERS: DossierChapter[] = [
 {
  "id": "montenegro",
  "num": "I",
  "title": "Zuzalu Montenegro",
  "place": "Lustica Bay, Montenegro",
  "dates": "25 Mar – 25 May 2023",
  "lede": "The prototype. Two hundred people in an off-season resort on the Adriatic, a geodesic dome for talks, a zero-knowledge passport, and no token or DAO by design.",
  "stats": [
   {
    "value": "~200",
    "label": "core residents"
   },
   {
    "value": "~800",
    "label": "people passed through"
   },
   {
    "value": "2",
    "label": "months"
   },
   {
    "value": "$1,800",
    "label": "per month, subsidised"
   }
  ],
  "photos": [
   {
    "src": "/zuzalu/01-3278d8.jpg",
    "caption": "Lustica Bay marina at sunset: the white Dome and the lighthouse.",
    "credit": "Noah Chon Lee",
    "hero": true
   },
   {
    "src": "/zuzalu/02-9701dd.jpg",
    "caption": "Residents outside the Dome at the marina.",
    "credit": "Milica Vulic / CoinDesk",
    "hero": false
   },
   {
    "src": "/zuzalu/03-bfa368.jpg",
    "caption": "Vitalik presenting the Zuzalu Quadratic Billboard experiment.",
    "credit": "Bernardo Vicente",
    "hero": false
   },
   {
    "src": "/zuzalu/04-72b1f3.jpg",
    "caption": "Closing panel on the amphitheatre stage, 25 May 2023.",
    "credit": "Shuyao Kong / Decrypt",
    "hero": false
   },
   {
    "src": "/zuzalu/05-17af57.jpg",
    "caption": "ZK talk inside the Dome, beanbags and laptops.",
    "credit": "Decrypt",
    "hero": false
   },
   {
    "src": "/zuzalu/06-0258f6.jpg",
    "caption": "Vitalik on the AKASHA social-networks panel in the Dome.",
    "credit": "AKASHA",
    "hero": false
   },
   {
    "src": "/zuzalu/07-5196f5.jpg",
    "caption": "Evening session on the Chedi terrace.",
    "credit": "Decrypt",
    "hero": false
   },
   {
    "src": "/zuzalu/08-ea1bc6.jpg",
    "caption": "The teal-and-yellow Zuzalu flag.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/09-761b0b.jpg",
    "caption": "Acro-yoga on the Chedi pool deck.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/10-77db0f.jpg",
    "caption": "Vitalik's day trip to UDG students in Podgorica, 28 Apr 2023.",
    "credit": "EuroCC / UDG",
    "hero": false
   },
   {
    "src": "/zuzalu/11-8397e7.jpg",
    "caption": "Boat trip in the Bay of Kotor.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/12-e2ed33.jpg",
    "caption": "Perast. Hero of Vitalik's essay and the Zupass ticket background.",
    "credit": "George Kedenburg III / Palladium",
    "hero": false
   }
  ],
  "videos": [
   {
    "href": "https://www.youtube.com/watch?v=hh_EWsyJIcc",
    "thumb": "/zuzalu/13-e5df85.jpg",
    "title": "Zuzalu in Montenegro (Lustica Bay channel)"
   },
   {
    "href": "https://www.youtube.com/watch?v=BathFxHadZ8",
    "thumb": "/zuzalu/14-5f4c48.jpg",
    "title": "CoinDesk: Zuzalu to close after 2 months"
   },
   {
    "href": "https://www.youtube.com/watch?v=6tlqPCuv2-E",
    "thumb": "/zuzalu/15-8a5864.jpg",
    "title": "Panel in the Dome with Vitalik (AKASHA)"
   },
   {
    "href": "https://www.youtube.com/watch?v=BAeMr3Xyb08",
    "thumb": "/zuzalu/16-00d163.jpg",
    "title": "Bankless: Vitalik on the experiment"
   }
  ]
 },
 {
  "id": "istanbul",
  "num": "II",
  "title": "ZuConnect Istanbul",
  "place": "Minoa Pera, Beyoğlu, Istanbul",
  "dates": "29 Oct – 11 Nov 2023",
  "lede": "The sequel, compressed. Two weeks in an 1896 Beyoğlu building with a bookstore, café, co-working floors and a red-seat theatre. Zupass grew into ticketing and polls; Vitalik ran a quadratic funding round inside the city.",
  "stats": [
   {
    "value": "~300",
    "label": "full-time residents"
   },
   {
    "value": "100+",
    "label": "part-timers"
   },
   {
    "value": "2",
    "label": "weeks before Devconnect"
   },
   {
    "value": "56",
    "label": "talks archived on StreamETH"
   }
  ],
  "photos": [
   {
    "src": "/zuzalu/17-b637ec.jpg",
    "caption": "Vitalik Buterin and Juan Benet, “What can technologists do to fix a fractured web?”, 7 Nov.",
    "credit": "Matters Lab",
    "hero": true
   },
   {
    "src": "/zuzalu/18-4eb31e.jpg",
    "caption": "Minoa Pera on Meşrutiyet Caddesi, the ZuConnect hub.",
    "credit": "AiCoin",
    "hero": false
   },
   {
    "src": "/zuzalu/19-cc06b3.jpg",
    "caption": "The theatre during a session. Slide: “Value-aligned tech stack.”",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/20-ff8898.jpg",
    "caption": "Vitalik with ZuSocial hackers in a loft above the rooftops.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/21-6aec90.jpg",
    "caption": "Vitalik on Community Notes and Birdwatch.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/22-c4b4af.jpg",
    "caption": "Panel on mechanism design for digital public spaces.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/23-08edac.jpg",
    "caption": "Night out in Beyoğlu.",
    "credit": "Noah Chon Lee",
    "hero": false
   },
   {
    "src": "/zuzalu/24-e04ce2.jpg",
    "caption": "Residents on the Asian side, Kadıköy.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/25-78f709.jpg",
    "caption": "The Zuzalians’ co-creation canvas.",
    "credit": "AiCoin",
    "hero": false
   },
   {
    "src": "/zuzalu/26-ac76e3.jpg",
    "caption": "Decentralized Social Day after-party.",
    "credit": "Matters Lab",
    "hero": false
   },
   {
    "src": "/zuzalu/27-4c6ca3.jpg",
    "caption": "Decentralized Social Day schedule, 7 Nov 2023.",
    "credit": "Matters Lab",
    "hero": false
   }
  ],
  "videos": [
   {
    "href": "https://www.youtube.com/watch?v=UVm15VIbtHM",
    "thumb": "/zuzalu/28-c4ac7a.jpg",
    "title": "Vitalik on the future of Zuzalu, 1 Nov 2023"
   },
   {
    "href": "https://www.youtube.com/watch?v=3d-y3boMIXw",
    "thumb": "/zuzalu/29-7be784.jpg",
    "title": "Vlog at the ZuConnect venue, 6 Nov"
   },
   {
    "href": "https://www.youtube.com/watch?v=ugXNQmWOH4Y",
    "thumb": "/zuzalu/30-7c69d4.jpg",
    "title": "Vlad Martynov on governance at ZuConnect"
   },
   {
    "href": "https://www.youtube.com/watch?v=3jCKdxQ9Pfw",
    "thumb": "/zuzalu/31-c44a67.jpg",
    "title": "ZK Day: ZK Email"
   }
  ]
 },
 {
  "id": "chiangmai",
  "num": "III",
  "title": "Chiang Mai Archipelago",
  "place": "Chiang Mai, Thailand",
  "dates": "30 Sep – 10 Nov 2024",
  "lede": "The peak. A dozen pop-up villages ran as neighbours with no central organiser, coordinated through pelago.city and timed before Devcon Bangkok. The community drew it as an island map and called it the Zuzapelago.",
  "stats": [
   {
    "value": "12+",
    "label": "villages at once"
   },
   {
    "value": "2,000+",
    "label": "people in the city"
   },
   {
    "value": "600–700",
    "label": "at Edge City Lanna"
   },
   {
    "value": "42",
    "label": "days Vitalik spent there"
   }
  ],
  "photos": [
   {
    "src": "/zuzalu/32-422eed.jpg",
    "caption": "“Zuzapelago Chiang Mai”, the showcase map.",
    "credit": "Zuzalu Town Halls",
    "hero": true
   },
   {
    "src": "/zuzalu/33-f1f073.jpg",
    "caption": "Edge City Lanna sign on the lawn at Wat Kate.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/34-0c00c2.jpg",
    "caption": "Vitalik at Cathy Tie’s plant gene-editing workshop.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/35-a04c25.jpg",
    "caption": "Invisible Garden opening, Vitalik centre.",
    "credit": "Invisible Garden",
    "hero": false
   },
   {
    "src": "/zuzalu/36-3a2bde.jpg",
    "caption": "Keynote hall at Edge City Lanna.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/37-54dd45.jpg",
    "caption": "Flood clean-up after the October 2024 floods.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/38-b072c4.jpg",
    "caption": "Sunday community dinner.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/39-81cba0.jpg",
    "caption": "The $60K “tools for human flourishing” hackathon.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/40-29fd6c.jpg",
    "caption": "Morning yoga.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/41-3ab0f9.jpg",
    "caption": "Kids’ program: toddlers to centenarians.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/42-3ee387.jpg",
    "caption": "Idext co-working, first week.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/43-177685.jpg",
    "caption": "Invisible Garden residents in Nimman.",
    "credit": "Invisible Garden",
    "hero": false
   },
   {
    "src": "/zuzalu/44-8759f3.jpg",
    "caption": "Closing group photo.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/45-017289.jpg",
    "caption": "Edge City Lanna village map.",
    "credit": "Edge City",
    "hero": false
   },
   {
    "src": "/zuzalu/46-6bbd9b.jpg",
    "caption": "ShanhaiWoo Chiang Mai opening, 5 Oct 2024.",
    "credit": "ShanhaiWoo",
    "hero": false
   }
  ],
  "videos": [
   {
    "href": "https://www.youtube.com/watch?v=0DwWqkyEda4",
    "thumb": "/zuzalu/47-d76c6d.jpg",
    "title": "Vitalik: Introduction to d/acc, Edge City Lanna"
   },
   {
    "href": "https://www.youtube.com/watch?v=8Y7xyzVBLPw",
    "thumb": "/zuzalu/48-a1ba1b.jpg",
    "title": "A day in the life at Edge City Lanna"
   },
   {
    "href": "https://www.youtube.com/watch?v=iAG5L-0RTwg",
    "thumb": "/zuzalu/49-712c73.jpg",
    "title": "Invisible Garden 2024 recap"
   },
   {
    "href": "https://www.youtube.com/watch?v=Kn_RKyPG8Ko",
    "thumb": "/zuzalu/50-6a0fb2.jpg",
    "title": "What is Edge City Lanna?"
   }
  ]
 }
];
export const DOSSIER_TIMELINE: TimelineRow[] = [
 {
  "kind": "prelude",
  "year": "2022",
  "when": "Apr",
  "what": [
   {
    "t": "Vitalik receives Montenegrin citizenship in Podgorica."
   }
  ]
 },
 {
  "kind": "prelude",
  "year": null,
  "when": "Jul",
  "what": [
   {
    "t": "“What do I think about network states?” lists four flaws Zuzalu is designed around."
   }
  ]
 },
 {
  "kind": "prelude",
  "year": "2023",
  "when": "Jan",
  "what": [
   {
    "t": "Four-person team scouts locations. ZUZALU LTD incorporated in the UK."
   }
  ]
 },
 {
  "kind": "prelude",
  "year": null,
  "when": "16 Mar",
  "what": [
   {
    "t": "Gitcoin passes GCP-005: $82K ops + $100K matching, Janine Leger on the ground."
   }
  ]
 },
 {
  "kind": "montenegro",
  "year": null,
  "when": "25 Mar – 25 May",
  "what": [
   {
    "t": "Zuzalu, Lustica Bay. ~200 residents, ~800 visitors. Zupass is born."
   }
  ]
 },
 {
  "kind": "montenegro",
  "year": null,
  "when": "May",
  "what": [
   {
    "t": "Press verdict: “would-be longevity state”, “Burning Man for futurists”."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": null,
  "when": "Aug – Oct",
  "what": [
   {
    "t": "First clones: "
   },
   {
    "t": "ShanHaiWoo",
    "href": "/shanhaiwoo-singapore-2026"
   },
   {
    "t": " in Jilin, MuChiangMai in Thailand."
   }
  ]
 },
 {
  "kind": "prelude",
  "year": null,
  "when": "6 Oct",
  "what": [
   {
    "t": "“Why I Built Zuzalu” in Palladium."
   }
  ]
 },
 {
  "kind": "istanbul",
  "year": null,
  "when": "29 Oct – 11 Nov",
  "what": [
   {
    "t": "ZuConnect Istanbul. ~300 residents. Quadratic funding inside the city."
   }
  ]
 },
 {
  "kind": "istanbul",
  "year": null,
  "when": "13–19 Nov",
  "what": [
   {
    "t": "Devconnect Istanbul runs on Zupass. FrogCrypto."
   }
  ]
 },
 {
  "kind": "pivot",
  "year": null,
  "when": "Dec",
  "what": [
   {
    "t": "“Zuzalu is dead, long live Zuzalu.” No central 2024 event; ~500 ETH to Gitcoin rounds instead."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": "2024",
  "when": "Jan – Feb",
  "what": [
   {
    "t": "Vitalia on Roatán",
    "href": "/infinita-city-2026"
   },
   {
    "t": ". Zu rounds fund 32 events and 28 tools."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": null,
  "when": "Feb",
  "what": [
   {
    "t": "Edge City founded by Leger and Kosters. Edge City Denver, 3,000 people."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": null,
  "when": "May – Sep",
  "what": [
   {
    "t": "Zanzalu",
    "href": "/zanzalu"
   },
   {
    "t": ", "
   },
   {
    "t": "Edge Esmeralda",
    "href": "/edge-esmeralda-2026-may-30-june-27"
   },
   {
    "t": " (1,300), "
   },
   {
    "t": "ZuBerlin",
    "href": "/futura-camp-2026-x-zuberlin"
   },
   {
    "t": ", ZuVillage Georgia, Aleph Buenos Aires."
   }
  ]
 },
 {
  "kind": "chiangmai",
  "year": null,
  "when": "30 Sep – 10 Nov",
  "what": [
   {
    "t": "Chiang Mai Archipelago. 12+ villages, 2,000+ people, 42 days of Vitalik."
   }
  ]
 },
 {
  "kind": "chiangmai",
  "year": null,
  "when": "12–15 Nov",
  "what": [
   {
    "t": "Devcon Bangkok: 12,500 tickets as Zupass PODs. Zuzalu showcase in Devcon week."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": "2025",
  "when": "Jan",
  "what": [
   {
    "t": "Edge City: 9,000+ attendees in 2024, all villages broke even. Zu-Grama, India’s first."
   }
  ]
 },
 {
  "kind": "pivot",
  "year": null,
  "when": "1 Apr",
  "what": [
   {
    "t": "Vitalik sends 274 ETH to Zuitzerland. ZUZALU LTD dissolved two weeks later."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": null,
  "when": "May",
  "what": [
   {
    "t": "Zuitzerland residency in the Alps, ~200 people. "
   },
   {
    "t": "Edge Esmeralda 2025",
    "href": "/edge-esmeralda-2026-may-30-june-27"
   },
   {
    "t": ", 850+."
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": null,
  "when": "Sep – Nov",
  "what": [
   {
    "t": "ZuKaş",
    "href": "/zukas-2026"
   },
   {
    "t": ", "
   },
   {
    "t": "Edge City Bhutan",
    "href": "/edge-city-bhutan-2026"
   },
   {
    "t": ", "
   },
   {
    "t": "ZuCity Japan",
    "href": "/zucity-popup-2026-annual-popup-city-in-komoro-nagano"
   },
   {
    "t": " buys houses in Komoro, Edge City Patagonia."
   }
  ]
 },
 {
  "kind": "prelude",
  "year": null,
  "when": "17 Dec",
  "what": [
   {
    "t": "“Let a thousand societies bloom.”"
   }
  ]
 },
 {
  "kind": "spinoff",
  "year": "2026",
  "when": "May – Aug",
  "what": [
   {
    "t": "Edge Esmeralda 2026",
    "href": "/edge-esmeralda-2026-may-30-june-27"
   },
   {
    "t": " (~850), "
   },
   {
    "t": "ZuBerlin",
    "href": "/futura-camp-2026-x-zuberlin"
   },
   {
    "t": ", "
   },
   {
    "t": "Zanzalu 3.0",
    "href": "/zanzalu"
   },
   {
    "t": ". Malaysia revokes Balaji’s "
   },
   {
    "t": "Network School",
    "href": "/network-school-learn-burn-and-earn"
   },
   {
    "t": "."
   }
  ]
 },
 {
  "kind": "now",
  "year": null,
  "when": "Now",
  "what": [
   {
    "t": "ZuCity Komoro",
    "href": "/zucity-popup-2026-annual-popup-city-in-komoro-nagano"
   },
   {
    "t": " live until 5 Oct. "
   },
   {
    "t": "ZuKaş Season 2",
    "href": "/zukas-2026"
   },
   {
    "t": " from 9 Sep. "
   },
   {
    "t": "Edge City India",
    "href": "/edgecity-goa-2026"
   },
   {
    "t": " from 11 Oct."
   }
  ]
 }
];
export const DOSSIER_SOURCES = "Sources: Vitalik Buterin’s essays (2022, 2023, 2025), the Gitcoin case study, Decrypt, CoinDesk, Matters Lab, Edge City, Invisible Garden, Noah Chon Lee, Bernardo Vicente, the StreamETH archive and Luma. Photos belong to the credited authors.";
