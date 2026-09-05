import { useState } from "react";
import { orpcClient } from "../../lib/orpc-client";

const PLATFORMS = [
	{ name: "YouTube", color: "#FF0000", domains: ["youtube.com", "youtu.be"] },
	{ name: "TikTok", color: "#000000", domains: ["tiktok.com"] },
	{ name: "X", color: "#000000", domains: ["twitter.com", "x.com"] },
	{ name: "Facebook", color: "#1877F2", domains: ["facebook.com", "fb.watch"] },
	{ name: "Instagram", color: "#E1306C", domains: ["instagram.com"] },
] as const;

const getPlatform = (url: string) => {
	try {
		const hostname = new URL(url).hostname.toLowerCase();

		return (
			PLATFORMS.find((platform) =>
				platform.domains.some(
					(domain) =>
						hostname === domain || hostname.endsWith(`.${domain}`),
				),
			) ?? null
		);
	} catch {
		return null;
	}
};

export const PublicDownloadPage = () => {
	const [url, setUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [downloadUrl, setDownloadUrl] = useState("");
	const [fileName, setFileName] = useState("");

	const platform = getPlatform(url);

	const handleDownload = async () => {
		const trimmedUrl = url.trim();

		if (!trimmedUrl) {
			setError("Video havolasini kiriting.");
			return;
		}

		if (!platform) {
			setError(
				"Faqat YouTube, TikTok, X, Facebook yoki Instagram havolasi qo‘llab-quvvatlanadi.",
			);
			return;
		}

		setLoading(true);
		setError("");
		setDownloadUrl("");
		setFileName("");

		try {
			const result = await orpcClient.downloads.create({
				url: trimmedUrl,
			});

			const task = result.download;

			if (!task?.id) {
				throw new Error("Yuklab olish vazifasi yaratilmadi.");
			}

			const checkStatus = async () => {
				const response = await orpcClient.downloads.list();
				const currentTask = response.downloads.find(
					(item) => item.id === task.id,
				);

				if (!currentTask) {
					return false;
				}

				if (currentTask.status === "failed") {
					throw new Error("Videoni yuklab olishda xatolik yuz berdi.");
				}

				if (currentTask.status === "completed") {
					setFileName(currentTask.savedFileName ?? "video");

					const apiBaseUrl =
						import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
						"http://localhost:3100";

					setDownloadUrl(`${apiBaseUrl}/download/${currentTask.id}`);
					setLoading(false);

					return true;
				}

				return false;
			};

			const poll = async () => {
				const completed = await checkStatus();

				if (!completed) {
					window.setTimeout(() => {
						void poll();
					}, 2000);
				}
			};

			await poll();
		} catch (err) {
			setLoading(false);
			setError(
				err instanceof Error
					? err.message
					: "Noma’lum xatolik yuz berdi.",
			);
		}
	};

	return (
		<main className="min-h-screen bg-background">
			<div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-5 py-16">
				<div className="w-full text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Videoni yuklab oling
					</h1>

					<p className="mt-3 text-muted-foreground">
						YouTube, TikTok, X, Facebook va Instagram
					</p>
				</div>

				<div className="mt-10 w-full">
					<div className="flex flex-col gap-3 sm:flex-row">
						<input
							value={url}
							onChange={(event) => {
								setUrl(event.target.value);
								setError("");
								setDownloadUrl("");
							}}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									void handleDownload();
								}
							}}
							placeholder="Video havolasini shu yerga joylashtiring"
							className="h-14 flex-1 rounded-xl border bg-background px-5 text-base outline-none transition focus:ring-2 focus:ring-ring"
						/>

						<button
							type="button"
							onClick={() => void handleDownload()}
							disabled={loading}
							className="h-14 rounded-xl bg-primary px-7 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{loading ? "Yuklanmoqda..." : "Yuklab olish"}
						</button>
					</div>

					{error && (
						<p className="mt-3 text-sm text-destructive">
							{error}
						</p>
					)}

					{downloadUrl && (
						<div className="mt-6 rounded-2xl border p-5 text-center">
							<p className="text-sm text-muted-foreground">
								Tayyor:
							</p>

							<p className="mt-1 font-medium">{fileName}</p>

							<a
								href={downloadUrl}
								download
								className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-6 font-medium text-primary-foreground transition hover:opacity-90"
							>
								Faylni yuklab olish
							</a>
						</div>
					)}
				</div>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					{PLATFORMS.map((item) => {
						const active = platform?.name === item.name;

						return (
							<div
								key={item.name}
								className="flex h-12 items-center rounded-xl border px-4 transition"
								style={{
									opacity: active ? 1 : 0.35,
									color: active ? item.color : undefined,
								}}
							>
								<span className="font-semibold">
									{item.name}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</main>
	);
};
