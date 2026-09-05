import { createFileRoute } from "@tanstack/react-router";
import { PublicDownloadPage } from "../components/pages/public-download-page";

export const Route = createFileRoute("/")({
	component: PublicDownloadPage,
});
