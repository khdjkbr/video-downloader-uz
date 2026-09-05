import { useState } from "react";
import { orpcClient } from "../../lib/orpc-client";

const PLATFORMS = [
	{
		name: "YouTube",
		color: "#FF0000",
		domains: ["youtube.com", "youtu.be"],
	},
	{
		name: "TikTok",
		color: "#000000",
		domains: ["tiktok.com"],
	},
	{
		name: "X",
		color: "#000000",
		domains: ["twitter.com", "x.com"],
	},
	{
		name: "Facebook",
		color: "#1877F2",
		domains: ["facebook.com", "fb.watch"],
	},
	{
		name: "Instagram",
		color: "#E1306C",
		domains: ["instagram.com"],
	},
] as const;

const MAX_POLL_TIME = 5 * 60 * 1000;
const POLL_INTERVAL = 2000;

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

const PlatformIcon = ({
	name,
	active,
}: {
	name: string;
	active: boolean;
}) => {
	const className = active
		? "h-7 w-7"
		: "h-7 w-7 opacity-40 grayscale";

	if (name === "YouTube") {
		return (
			<svg
				viewBox="0 0 24 24"
				className={className}
				aria-hidden="true"
			>
				<path
					fill="#FF0000"
					d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8Z"
				/>
				<path fill="#fff" d="m9.6 15.7 6.2-3.7-6.2-3.7v7.4Z" />
			</svg>
		);
	}

	if (name === "TikTok") {
		return (
			<svg
				viewBox="0 0 24 24"
				className={className}
				aria-hidden="true"
			>
				<path
					fill="#25F4EE"
					d="M14.8 3h3.1c.3 1.8 1.4 3.2 3.1 4v3.2c-1.2-.1-2.4-.5-3.4-1.1v6.4a6.4 6.4 0 1 1-5.4-6.3v3.3a3.1 3.1 0 1 0 2.3 3V3h.3Z"
				/>
				<path
					fill="#FE2C55"
					d="M13.5 4.2h3.1c.4 1.5 1.3 2.5 2.7 3.1v3.1a7.7 7.7 0 0 1-2.7-.9v6a6.4 6.4 0 0 1-6.4 6.4A6.3 6.3 0 0 1 7 20.8a6.4 6.4 0 0 0 10.1-5.2V9.2c.8.5 1.7.8 2.7.9V8c-1.5-.6-2.5-1.8-2.9-3.4h-3.4v10.1a3.1 3.1 0 0 1-4.9 2.5 3.1 3.1 0 0 0 5-2.6V4.2Z"
				/>
			</svg>
		);
	}

	if (name === "X") {
		return (
			<svg
				viewBox="0 0 24 24"
				className={className}
				aria-hidden="true"
			>
				<path
					fill="currentColor"
					d="M18.9 2H22l-6.8 7.8L23.2 22h-6.4l-5-6.5L6.1 22H3l7.3-8.4L2.2 2h6.5l4.5 5.9L18.9 2Zm-1.1 17.7h1.7L7.7 4.2H5.9l11.9 15.5Z"
				/>
			</svg>
		);
	}

	if (name === "Facebook") {
		return (
			<svg
				viewBox="0 0 24 24"
				className={className}
				aria-hidden="true"
			>
				<path
					fill="#1877F2"
					d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.3c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12Z"
				/>
			</svg>
		);
	}

	return (
		<svg
			viewBox="0 0 24 24"
			className={className}
			aria-hidden="true"
		>
			<defs>
				<linearGradient id="instagram-gradient" x1="0" y1="1" x2="1" y2="0">
					<stop offset="0%" stopColor="#FFDC80" />
					<stop offset="35%" stopColor="#F77737" />
					<stop offset="65%" stopColor="#E1306C" />
					<stop offset="100%" stopColor="#833AB4" />
				</linearGradient>
			</defs>
			<rect
				x="3"
				y="3"
				width="18"
				height="18"
				rx="5"
				fill="none"
				stroke="url(#instagram-gradient)"
				strokeWidth="2"
			/>
			<circle
				cx="12"
				cy="12"
				r="4"
				fill="none"
				stroke="url(#instagram-gradient)"
				strokeWidth="2"
			/>
			<circle cx="17.4" cy="6.7" r="1.2" fill="#E1306C" />
		</svg>
	);
};

export const PublicDownloadPage = () => {
	const [url, setUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [downloadUrl, setDownloadUrl] = useState("");
	const [fileName, setFileName] = useState("");

	const platform = getPlatform(url);

	const handleUrlChange = (value: string) => {
		setUrl(value);
		setError("");
		setDownloadUrl("");
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		const pastedText = event.clipboardData.getData("text").trim();

		if (pastedText) {
			setUrl(pastedText);
			setError("");
			setDownloadUrl("");
		}
	};

	const handleDownload = async () => {
		const trimmedUrl = url.trim();

		if (!trimmedUrl) {
			setError("Video havolasini kiriting.");
			return;
		}

		const detectedPlatform = getPlatform(trimmedUrl);

		if (!detectedPlatform) {
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
				type: "video",
			});

			const task = result.download;

			if (!task?.id) {
				throw new Error("Yuklab olish vazifasi yaratilmadi.");
			}

			const startedAt = Date.now();

			const checkStatus = async (): Promise<boolean> => {
				if (Date.now() - startedAt >= MAX_POLL_TIME) {
					throw new Error(
						"Yuklab olish juda uzoq davom etmoqda. Keyinroq qayta urinib ko‘ring.",
					);
				}

				const activeResponse = await orpcClient.downloads.list();

				const activeTask = activeResponse.downloads.find(
					(item) => item.id === task.id,
				);

				if (activeTask) {
					if (activeTask.status === "error") {
						throw new Error(
							activeTask.error ??
								"Videoni yuklab olishda xatolik yuz berdi.",
						);
					}

					return false;
				}

				const historyResponse = await orpcClient.history.list();

				const historyTask = historyResponse.history.find(
					(item) => item.id === task.id,
				);

				if (!historyTask) {
					return false;
				}

				if (historyTask.status === "error") {
					throw new Error(
						historyTask.error ??
							"Videoni yuklab olishda xatolik yuz berdi.",
					);
				}

				if (historyTask.status === "cancelled") {
					throw new Error("Yuklab olish bekor qilindi.");
				}

				if (historyTask.status === "completed") {
					const apiBaseUrl =
						import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
						"http://localhost:3100";

					setFileName(historyTask.savedFileName ?? "video");
					setDownloadUrl(
						`${apiBaseUrl}/download/${historyTask.id}`,
					);
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
					}, POLL_INTERVAL);
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
			<div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-5 py-16 sm:px-8 sm:py-24">
				<div className="w-full text-center">
					<div className="mb-6 inline-flex items-center rounded-full border px-4 py-2 text-sm text-muted-foreground">
						Tez, oddiy va qulay
					</div>

					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
						Videoni yuklab oling
					</h1>

					<p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
						Sevimli videolaringizni havola orqali tez va oson
						yuklab oling.
					</p>
				</div>

				<div className="mt-10 w-full">
					<div className="rounded-2xl border bg-background p-2 shadow-sm">
						<div className="flex flex-col gap-2 sm:flex-row">
							<input
								value={url}
								onChange={(event) =>
									handleUrlChange(event.target.value)
								}
								onPaste={handlePaste}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										void handleDownload();
									}
								}}
								placeholder="Video havolasini shu yerga joylashtiring"
								className="h-14 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground focus:ring-0"
							/>

							<button
								type="button"
								onClick={() => void handleDownload()}
								disabled={loading}
								className="h-14 rounded-xl bg-primary px-7 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{loading
									? "Yuklanmoqda..."
									: "Yuklab olish"}
							</button>
						</div>
					</div>

					<p className="mt-3 px-1 text-sm text-muted-foreground">
						Havolani nusxalang va yuqoridagi maydonga joylashtiring.
					</p>

					{error && (
						<p className="mt-3 text-sm text-destructive">
							{error}
						</p>
					)}

					{downloadUrl && (
						<div className="mt-6 rounded-2xl border p-6 text-center">
							<p className="text-sm text-muted-foreground">
								Tayyor:
							</p>

							<p className="mt-1 break-all font-medium">
								{fileName}
							</p>

							<a
								href={downloadUrl}
								download
								className="mt-5 inline-flex h-12 items-center rounded-xl bg-primary px-7 font-semibold text-primary-foreground transition hover:opacity-90"
							>
								Faylni yuklab olish
							</a>
						</div>
					)}
				</div>

				<div className="mt-12 w-full">
					<p className="mb-4 text-center text-sm font-medium text-muted-foreground">
						Qo‘llab-quvvatlanadigan platformalar
					</p>

					<div className="flex flex-wrap items-center justify-center gap-3">
						{PLATFORMS.map((item) => {
							const active = platform?.name === item.name;

							return (
								<div
									key={item.name}
									className="flex h-14 items-center gap-3 rounded-xl border px-4 transition"
									style={{
										opacity: active ? 1 : 0.42,
										borderColor: active
											? item.color
											: undefined,
									}}
								>
									<PlatformIcon
										name={item.name}
										active={active}
									/>

									<span className="font-medium">
										{item.name}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-auto pt-16 text-center text-xs text-muted-foreground">
					Yuklaymiz.uz
				</div>
			</div>
		</main>
	);
};
