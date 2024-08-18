import { useEffect, useState } from "react";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ReloadIcon, ClipboardIcon, DownloadIcon } from "@radix-ui/react-icons";
import { SelectValue } from "@radix-ui/react-select";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "./components/ui/select";

type InstanceResponse = [string, InstanceProperty];

type CaptionsResponse = {
	captions: CaptionObject[];
};

type CaptionObject = {
	label: string;
	languageCode: string;
	url: string;
};

type InstanceProperty = {
	api: boolean;
	cors: boolean;
	type: "https" | "i2p" | "onion";
};


function App() {
	const [baseUrl, setBaseUrl] = useState<string>("invidious.einfachzocken.eu");
	const [instanceList, setInstanceList] = useState<string[]>([baseUrl]);
	const [message, setMessage] = useState<string | undefined>(undefined);
	const [captionFormat, setCaptionFormat] = useState<string>("txt");
	const [input, setInput] = useState("");
	const [videoId, setVideoId] = useState<string | undefined>(undefined);
	const [searchLoading, setSearchLoading] = useState(false);
	const [getLoading, setGetLoading] = useState(false);
	const [captionsRes, setCaptionsRes] = useState<CaptionObject[] | undefined>(
		undefined,
	);
	const [captionUrl, setCaptionUrl] = useState<string | undefined>(undefined);
	const [captionText, setCaptionText] = useState<string | undefined>(undefined);

	async function fetchAndSetInstances() {
		const res = await fetch("https://api.invidious.io/instances.json");
		let newInstances: InstanceResponse[] = await res.json();
		newInstances = newInstances.filter((instance) => {
			const p = instance[1];
			return p.type == "https" && p.cors === true && p.api === true;
		});

		const newInstanceList = newInstances.map((instance) => instance[0]);
		setInstanceList(newInstanceList);
	}
	useEffect(() => {
		fetchAndSetInstances();
	}, []);

	useEffect(() => {
		if (!captionText) {
			setMessage(undefined);
			return;
		}
		switch (captionFormat) {
			case "vtt":
				setMessage(captionText);
				break;
			case "txt":
				setMessage(extractPlainTextFromVtt(captionText));
				break;
		}
	}, [captionText, captionFormat]);

	function extractPlainTextFromVtt(vttText: string) {
		// Split the VTT text by line breaks
		const lines = vttText.split("\n");

		// Initialize an empty array to store the plain text content
		let plainText = [];

		// Iterate through each line of the VTT text
		// Skip first 3 lines
		for (let i = 3; i < lines.length; i++) {
			// Check if the line contains a timestamp
			if (
				/^\d{2}:\d{2}:\d{2}.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}.\d{3}/.test(
					lines[i],
				)
			) {
				// Skip this line as it contains a timestamp
				continue;
			}

			// Check if the line contains any VTT formatting tags
			// if (/^<\/?[^>]+(>|$)/.test(lines[i])) {
			//   // Skip this line as it contains VTT formatting tags
			//   continue;
			// }

			// Remove any leading or trailing whitespace
			const line = lines[i].replace(/&nbsp;/g, " ").trim();

			// Check if line is empty
			if (!line) {
				continue;
			}

			// Add the line to the plain text content array
			plainText.push(line);
		}

		// Join the plain text content array into a single string
		return plainText.join(" ");
	}

	async function getCaption(url: string) {
		setGetLoading(true);
		try {
			const res = await fetch("https://" + baseUrl + url);
			const text = await res.text();
			setCaptionText(text);
		} catch (error) {
			setMessage("Error fetching subtitles! try chaning instance");
		}
		setGetLoading(false);
	}

	async function listCaption(id: string) {
		setSearchLoading(true);
		try {
			const res = await fetch("https://" + baseUrl + "/api/v1/captions/" + id);
			const captionsRes: CaptionsResponse = await res.json();
			setCaptionsRes(captionsRes.captions);
		} catch (error) {
			setMessage("Error! Check Video URL or try changing instance");
		}
		// const captionUrl = captionsRes.captions[0].url
		// getCaption(captionUrl)
		setSearchLoading(false);
	}

	function resetFormAll() {
		setInput("");
		resetForm();
	}

	function resetForm() {
		setCaptionsRes(undefined);
		setCaptionUrl(undefined);
		setCaptionText(undefined);
		setMessage("");
	}

	function handleSearch() {
		resetForm();
		const currVideoId = parseVideoId(input);
		if (!currVideoId) {
			setMessage("Invalid Video URL");
			return;
		}
		setVideoId(currVideoId);
		listCaption(currVideoId);
	}
	function parseVideoId(text: string) {
		if (/^[-_a-zA-Z0-9]{11}$/.test(text)) {
			return text;
		}

		var regExp =
			/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = text.match(regExp);
		if (match && match[2].length == 11) {
			return match[2];
		} else {
			return null;
		}
	}
	async function writeClipboardText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			throw Error(error as string);
		}
	}

	function copyCaption() {
		if (message) {
			writeClipboardText(message)
				.then(() => {
					alert("Copied successfully");
				})
				.catch((err) => {
					console.error(err);
					alert(err);
				});
		}
	}

	function downloadCaption() {
		if (!message) return;
		const element = document.createElement("a");
		const file = new Blob([message], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = `${videoId}.${captionFormat}`;
		document.body.appendChild(element);
		element.click();
	}

	useEffect(() => {
		console.log("Base url changed", baseUrl);
	}, [baseUrl]);

	return (
		<div className=" flex flex-col max-h-dvh ">
			<Navbar />
			<div className="flex self-center w-full flex-col  gap-4  p-4 md:py-8 max-w-2xl max-h-full overflow-y-auto">
				<div className="flex gap-4">
					<div className="w-full">
						<Select defaultValue={baseUrl} onValueChange={setBaseUrl}>
							<SelectTrigger>
								<SelectValue placeholder="Select an Instance" />
							</SelectTrigger>
							<SelectContent>
								{instanceList?.map((instance) => (
									<SelectItem key={instance} value={instance}>
										{instance.toString()}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<Input
					placeholder="Enter YouTube Video URL"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					type="text"
				/>
				<div className="flex gap-4">
					<div className="w-28">
						<Select defaultValue="txt" onValueChange={setCaptionFormat}>
							<SelectTrigger>
								<SelectValue placeholder="Format" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={"vtt"}>vtt</SelectItem>
								<SelectItem value={"txt"}>Text</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Button className="flex-grow" onClick={handleSearch}>
						Search Subtitle
						{searchLoading && (
							<ReloadIcon className="w-4 h-4 ml-2 animate-spin" />
						)}
					</Button>
					<Button className="" onClick={resetFormAll} variant={"destructive"}>
						Reset
					</Button>
				</div>
				{captionsRes && (
					<div className="flex gap-4">
						<Select onValueChange={setCaptionUrl}>
							<SelectTrigger>
								<SelectValue placeholder="Select Language" />
							</SelectTrigger>
							<SelectContent>
								{captionsRes?.map((c, i) => (
									<SelectItem key={i} value={c.url}>
										{c.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button
							className="w-40"
							disabled={!captionUrl}
							onClick={() => getCaption(captionUrl!)}
						>
							Submit
							{getLoading && (
								<ReloadIcon className="w-4 h-4 ml-2 animate-spin" />
							)}
						</Button>
					</div>
				)}
				{message && (
					<pre className="whitespace-pre-wrap p-4 overflow-y-scroll border rounded-s-lg relative">
						{captionText && (
							<div className="sticky flex  pb-4 gap-2 justify-end top-0 ">
								<Button onClick={downloadCaption} variant={"outline"}>
									<DownloadIcon />
								</Button>
								<Button onClick={copyCaption} variant={"outline"}>
									<ClipboardIcon />
								</Button>
							</div>
						)}
						{message}
					</pre>
				)}
			</div>
		</div>
	);
}

export default App;

