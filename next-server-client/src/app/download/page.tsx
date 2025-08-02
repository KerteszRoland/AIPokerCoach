interface GithubAsset {
  name: string;
  browser_download_url: string;
}

export default async function DownloadPage() {
  const response = await fetch(
    "https://api.github.com/repos/KerteszRoland/AIPokerCoach/releases/latest"
  );
  const data = await response.json();
  const downloadLink = data.assets.find((asset: GithubAsset) =>
    asset.name.endsWith(".msi")
  ).browser_download_url;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Thanks for downloading!</h1>
      <p className="text-lg mb-4">
        Your download should start automatically...
      </p>
      <p className="text-sm text-foreground">
        If it doesn&apos;t start,{" "}
        <a href={downloadLink} className="text-blue-500 hover:underline">
          click here
        </a>
      </p>
      <meta httpEquiv="refresh" content={`0;url=${downloadLink}`} />
    </div>
  );
}
