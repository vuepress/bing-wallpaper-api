import type { VercelRequest, VercelResponse } from "@vercel/node";

interface BingImageContent extends Record<string, any> {
  BackstageUrl: string;
  Copyright: string;
  Description: string;
  Headline: string;
  Image: {
    Downloadable: boolean;
    Url: string;
    Wallpaper: string;
  };
  QuickFact: {
    MainText: string;
    LinkUrl: string;
    LinkText: string;
  };
  Title: string;
}

interface BingMediaContents extends Record<string, any> {
  ImageContent: BingImageContent;
}

interface BingResponse extends Record<string, any> {
  MediaContents: BingMediaContents[];
}

interface BingWallpaperInfo {
  title: string;
  description: string;
  headline: string;
  url: string;
  wallpaper: string;
  downloadable: boolean;
  copyright: string;
  quickFact: string;
}

const getBingWallpaper = async (
  lang: string | string[]
): Promise<BingWallpaperInfo[]> => {
  const res = await fetch(
    `https://cn.bing.com/hp/api/model?FORM=BEHPTB${
      lang === "en" ? "&ensearch=1" : ""
    }`
  );
  const { MediaContents }: BingResponse = await res.json();

  return MediaContents.map(({ ImageContent }) => ({
    title: ImageContent.Title,
    description: ImageContent.Description,
    headline: ImageContent.Headline,
    url: ImageContent.Image.Url,
    wallpaper: ImageContent.Image.Wallpaper,
    downloadable: ImageContent.Image.Downloadable,
    copyright: ImageContent.Copyright + (lang === "en" ? "&ensearch=1" : ""),
    quickFact: ImageContent.QuickFact.MainText,
  }));
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { lang = "zh" } = req.query;

  res.setHeader("Cache-Control", "s-maxage=14400");

  return res.json(await getBingWallpaper(lang));
};

export default handler;
