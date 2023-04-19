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
  url: string;
  wallpaper: string;
  downloadable: boolean;
  locales: Record<
    string,
    {
      title: string;
      description: string;
      headline: string;
      copyright: string;
      backstage: string;
      quickFact: string;
    }
  >;
}

const getBingWallpaper = async (): Promise<BingWallpaperInfo[]> => {
  const [
    { MediaContents: zhMediaContents },
    { MediaContents: enMediaContents },
  ] = await Promise.all([
    <Promise<BingResponse>>(
      (await fetch(`https://cn.bing.com/hp/api/model?FORM=BEHPTB`)).json()
    ),
    <Promise<BingResponse>>(
      (
        await fetch(`https://cn.bing.com/hp/api/model?FORM=BEHPTB&ensearch=1`)
      ).json()
    ),
  ]);

  return zhMediaContents.map(({ ImageContent }, index) => {
    const enImageContent = enMediaContents[index].ImageContent;

    return {
      url: "https://bing.com" + ImageContent.Image.Url,
      wallpaper: "https://bing.com" + ImageContent.Image.Wallpaper,
      downloadable: ImageContent.Image.Downloadable,
      locales: {
        zh: {
          title: ImageContent.Title,
          description: ImageContent.Description,
          headline: ImageContent.Headline,
          copyright: ImageContent.Copyright,
          backstage: "https://bing.com" + ImageContent.BackstageUrl,
          quickFact: ImageContent.QuickFact.MainText,
        },
        en: {
          title: enImageContent.Title,
          description: enImageContent.Description,
          headline: enImageContent.Headline,
          copyright: enImageContent.Copyright,
          backstage:
            "https://bing.com" + enImageContent.BackstageUrl + "&ensearch=1",
          quickFact: enImageContent.QuickFact.MainText,
        },
      },
    };
  });
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader("Cache-Control", "s-maxage=14400");

  return res.json(await getBingWallpaper());
};

export default handler;
