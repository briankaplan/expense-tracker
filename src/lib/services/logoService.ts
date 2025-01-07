import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface LogoSource {
  url: string;
  quality: number; // 0-100
  source: 'clearbit' | 'favicon' | 'google' | 'custom';
}

const LOGO_CACHE = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Known subscription services with their logos
const KNOWN_SERVICES: Record<string, string> = {
  // Streaming Services
  'netflix': 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
  'spotify': 'https://www.spotify.com/favicon.ico',
  'amazon prime': 'https://www.amazon.com/favicon.ico',
  'disney+': 'https://static-assets.bamgrid.com/product/disneyplus/favicon.ico',
  'apple music': 'https://www.apple.com/favicon.ico',
  'youtube premium': 'https://www.youtube.com/favicon.ico',
  'hulu': 'https://www.hulu.com/favicon.ico',
  'hbo max': 'https://www.max.com/favicon.ico',
  'paramount+': 'https://www.paramountplus.com/favicon.ico',
  'peacock': 'https://www.peacocktv.com/favicon.ico',
  'apple tv+': 'https://tv.apple.com/favicon.ico',
  'discovery+': 'https://www.discoveryplus.com/favicon.ico',
  'crunchyroll': 'https://www.crunchyroll.com/favicon.ico',
  'dazn': 'https://www.dazn.com/favicon.ico',

  // Productivity & Software
  'microsoft 365': 'https://www.microsoft.com/favicon.ico',
  'google workspace': 'https://workspace.google.com/favicon.ico',
  'dropbox': 'https://www.dropbox.com/favicon.ico',
  'slack': 'https://slack.com/favicon.ico',
  'zoom': 'https://zoom.us/favicon.ico',
  'adobe creative cloud': 'https://www.adobe.com/favicon.ico',
  'notion': 'https://www.notion.so/favicon.ico',
  'evernote': 'https://www.evernote.com/favicon.ico',
  'asana': 'https://www.asana.com/favicon.ico',
  'trello': 'https://trello.com/favicon.ico',
  'github': 'https://github.com/favicon.ico',
  'gitlab': 'https://gitlab.com/favicon.ico',
  'atlassian': 'https://www.atlassian.com/favicon.ico',
  'jira': 'https://www.atlassian.com/favicon.ico',
  'confluence': 'https://www.atlassian.com/favicon.ico',

  // Cloud Storage
  'google drive': 'https://www.google.com/drive/favicon.ico',
  'icloud': 'https://www.icloud.com/favicon.ico',
  'onedrive': 'https://www.microsoft.com/favicon.ico',
  'box': 'https://www.box.com/favicon.ico',

  // Gaming
  'xbox game pass': 'https://www.xbox.com/favicon.ico',
  'playstation plus': 'https://www.playstation.com/favicon.ico',
  'nintendo switch online': 'https://www.nintendo.com/favicon.ico',
  'ea play': 'https://www.ea.com/favicon.ico',
  'ubisoft+': 'https://www.ubisoft.com/favicon.ico',
  'discord nitro': 'https://discord.com/favicon.ico',

  // News & Reading
  'medium': 'https://medium.com/favicon.ico',
  'new york times': 'https://www.nytimes.com/favicon.ico',
  'wall street journal': 'https://www.wsj.com/favicon.ico',
  'washington post': 'https://www.washingtonpost.com/favicon.ico',
  'economist': 'https://www.economist.com/favicon.ico',
  'bloomberg': 'https://www.bloomberg.com/favicon.ico',
  'kindle unlimited': 'https://www.amazon.com/favicon.ico',
  'audible': 'https://www.audible.com/favicon.ico',
  'scribd': 'https://www.scribd.com/favicon.ico',

  // Fitness & Wellness
  'peloton': 'https://www.onepeloton.com/favicon.ico',
  'fitbod': 'https://www.fitbod.me/favicon.ico',
  'strava': 'https://www.strava.com/favicon.ico',
  'myfitnesspal': 'https://www.myfitnesspal.com/favicon.ico',
  'calm': 'https://www.calm.com/favicon.ico',
  'headspace': 'https://www.headspace.com/favicon.ico',

  // Security & VPN
  'nordvpn': 'https://nordvpn.com/favicon.ico',
  'expressvpn': 'https://www.expressvpn.com/favicon.ico',
  'dashlane': 'https://www.dashlane.com/favicon.ico',
  '1password': 'https://1password.com/favicon.ico',
  'lastpass': 'https://www.lastpass.com/favicon.ico',
  'norton': 'https://norton.com/favicon.ico',
  'mcafee': 'https://www.mcafee.com/favicon.ico',

  // Music & Audio
  'tidal': 'https://tidal.com/favicon.ico',
  'pandora': 'https://www.pandora.com/favicon.ico',
  'soundcloud': 'https://soundcloud.com/favicon.ico',
  'deezer': 'https://www.deezer.com/favicon.ico',

  // Education
  'coursera': 'https://www.coursera.org/favicon.ico',
  'udemy': 'https://www.udemy.com/favicon.ico',
  'skillshare': 'https://www.skillshare.com/favicon.ico',
  'masterclass': 'https://www.masterclass.com/favicon.ico',
  'duolingo': 'https://www.duolingo.com/favicon.ico',
  'brilliant': 'https://brilliant.org/favicon.ico',

  // Design & Creative
  'canva': 'https://www.canva.com/favicon.ico',
  'figma': 'https://www.figma.com/favicon.ico',
  'sketch': 'https://www.sketch.com/favicon.ico',
  'invision': 'https://www.invisionapp.com/favicon.ico',

  // Developer Tools
  'jetbrains': 'https://www.jetbrains.com/favicon.ico',
  'digitalocean': 'https://www.digitalocean.com/favicon.ico',
  'heroku': 'https://www.heroku.com/favicon.ico',
  'aws': 'https://aws.amazon.com/favicon.ico',
  'azure': 'https://azure.microsoft.com/favicon.ico',
  'google cloud': 'https://cloud.google.com/favicon.ico',
};

// Additional logo sources for better quality
const LOGO_CDN_URLS: Record<string, string> = {
  // Streaming
  'netflix': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/227_Netflix_logo-512.png',
  'spotify': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/315_Spotify_logo-512.png',
  'amazon prime': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/12_Prime_Amazon_logo-512.png',
  'disney+': 'https://cdn.icon-icons.com/icons2/2657/PNG/512/disney_plus_icon_161064.png',
  'hulu': 'https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/hulu-512.png',
  'youtube premium': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/395_Youtube_logo-512.png',
  'hbo max': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/hbo_logo_icon_168124.png',
  
  // Productivity
  'slack': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/306_Slack_logo-512.png',
  'dropbox': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/84_Dev_logo_logos-512.png',
  'notion': 'https://cdn.icon-icons.com/icons2/2429/PNG/512/notion_logo_icon_147257.png',
  'microsoft 365': 'https://cdn.icon-icons.com/icons2/1156/PNG/512/1486565573-microsoft-office_81557.png',
  'google workspace': 'https://cdn.icon-icons.com/icons2/2642/PNG/512/google_workspace_logo_icon_159345.png',
  
  // Design
  'figma': 'https://cdn4.iconfinder.com/data/icons/logos-brands-in-colors/3000/figma-logo-512.png',
  'adobe creative cloud': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/4_Adobe_Creative_Cloud_logo_logos-512.png',
  'canva': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/canva_logo_icon_168460.png',
  
  // Security
  '1password': 'https://cdn.icon-icons.com/icons2/2429/PNG/512/1password_logo_icon_147062.png',
  'lastpass': 'https://cdn.icon-icons.com/icons2/2429/PNG/512/lastpass_logo_icon_147099.png',
  'nordvpn': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/nordvpn_logo_icon_167802.png',
  
  // Social & Communication
  'discord nitro': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/91_Discord_logo_logos-512.png',
  'zoom': 'https://cdn4.iconfinder.com/data/icons/logos-brands-in-colors/3000/zoom-logo-512.png',
  
  // Gaming
  'xbox game pass': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/387_Xbox_logo-512.png',
  'playstation plus': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/271_Playstation_logo_logos-512.png',
  'nintendo switch online': 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/nintendo_switch-512.png',
  
  // Cloud
  'aws': 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/23_Aws_logo_logos-512.png',
  'google cloud': 'https://cdn4.iconfinder.com/data/icons/google-i-o-2016/512/google_cloud-512.png',
  'azure': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/microsoft_azure_logo_icon_168977.png',
  
  // Education
  'coursera': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/coursera_logo_icon_168716.png',
  'udemy': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/udemy_logo_icon_168372.png',
  'duolingo': 'https://cdn4.iconfinder.com/data/icons/logos-brands-in-colors/3000/duolingo-logo-512.png',
  
  // Fitness
  'strava': 'https://cdn4.iconfinder.com/data/icons/logos-brands-in-colors/3000/strava-logo-512.png',
  'peloton': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/peloton_logo_icon_168585.png',
  
  // News & Reading
  'medium': 'https://cdn4.iconfinder.com/data/icons/social-media-circle-7/512/Medium_circle-512.png',
  'audible': 'https://cdn.icon-icons.com/icons2/2699/PNG/512/audible_logo_icon_168464.png',
};

export async function getSubscriptionLogo(
  name: string,
  domain?: string
): Promise<string | null> {
  const normalizedName = name.toLowerCase().trim();
  
  // Check cache first
  const cached = LOGO_CACHE.get(normalizedName);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  // Try high-quality CDN logos first
  const cdnLogo = LOGO_CDN_URLS[normalizedName];
  if (cdnLogo) {
    try {
      const response = await fetch(cdnLogo);
      if (response.ok) {
        LOGO_CACHE.set(normalizedName, { url: cdnLogo, timestamp: Date.now() });
        return cdnLogo;
      }
    } catch (error) {
      console.error('Failed to fetch CDN logo:', error);
    }
  }

  // Try known services
  const knownLogo = KNOWN_SERVICES[normalizedName];
  if (knownLogo) {
    LOGO_CACHE.set(normalizedName, { url: knownLogo, timestamp: Date.now() });
    return knownLogo;
  }

  try {
    const sources: LogoSource[] = [];

    // Try Clearbit if we have a domain
    if (domain) {
      sources.push({
        url: `https://logo.clearbit.com/${domain}`,
        quality: 90,
        source: 'clearbit'
      });
    }

    // Try favicon if we have a domain
    if (domain) {
      sources.push({
        url: `https://${domain}/favicon.ico`,
        quality: 70,
        source: 'favicon'
      });
    }

    // Use AI to find the most likely domain if not provided
    if (!domain) {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helper that identifies the most likely official website domain for subscription services. Respond with just the domain, no explanation.'
          },
          {
            role: 'user',
            content: `What's the official website domain for ${name}?`
          }
        ],
        model: 'gpt-4',
        temperature: 0,
        max_tokens: 50
      });

      const suggestedDomain = completion.choices[0].message.content?.trim().toLowerCase();
      if (suggestedDomain) {
        sources.push({
          url: `https://logo.clearbit.com/${suggestedDomain}`,
          quality: 80,
          source: 'clearbit'
        });
        sources.push({
          url: `https://${suggestedDomain}/favicon.ico`,
          quality: 60,
          source: 'favicon'
        });
      }
    }

    // Try each source in order of quality until we find a working logo
    for (const source of sources.sort((a, b) => b.quality - a.quality)) {
      try {
        const response = await fetch(source.url);
        if (response.ok) {
          LOGO_CACHE.set(normalizedName, { url: source.url, timestamp: Date.now() });
          return source.url;
        }
      } catch (error) {
        console.error(`Failed to fetch logo from ${source.source}:`, error);
      }
    }

    // If all else fails, generate an initial avatar
    const initial = name.charAt(0).toUpperCase();
    const avatarUrl = `https://ui-avatars.com/api/?name=${initial}&background=random&size=128`;
    LOGO_CACHE.set(normalizedName, { url: avatarUrl, timestamp: Date.now() });
    return avatarUrl;

  } catch (error) {
    console.error('Error getting subscription logo:', error);
    return null;
  }
}

export function clearLogoCache(name?: string) {
  if (name) {
    LOGO_CACHE.delete(name.toLowerCase().trim());
  } else {
    LOGO_CACHE.clear();
  }
} 