'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { HexColorPicker } from 'react-colorful';
import generateMermaidFlowchart from 'json-canvas-to-mermaid';

export default function Home() {
	const [jsonCanvas, setJsonCanvas] = useState(null);
	const [mermaidFlowchart, setMermaidFlowchart] = useState('');
	const [fileName, setFileName] = useState('');
	const [fileError, setFileError] = useState('');
	const [copySuccess, setCopySuccess] = useState(false);
	const [customColors, setCustomColors] = useState({
		1: '#fb464c', // red
		2: '#e9973f', // orange
		3: '#e0de71', // yellow
		4: '#44cf6e', // green
		5: '#53dfdd', // cyan
		6: '#a882ff', // purple
	});
	const [selectedColorIndex, setSelectedColorIndex] = useState(null);

	const convertToMermaid = (jsonData) => {
		// const hierarchicalData = buildJsonCanvasHierarchy(jsonData);
		const mermaid = generateMermaidFlowchart(jsonData, customColors);
		setMermaidFlowchart(mermaid);
	};

	const handleFileProcess = (file) => {
		if (file) {
			if (file.name.toLowerCase().endsWith('.canvas')) {
				setFileName(file.name);
				setFileError('');
				const reader = new FileReader();
				reader.onload = (e) => {
					const fileContent = e.target.result;
					const jsonData = JSON.parse(fileContent);
					setJsonCanvas(jsonData);
					convertToMermaid(jsonData);
				};
				reader.readAsText(file);
			} else {
				setFileName('');
				setFileError('Please select a .canvas file.');
			}
		}
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		handleFileProcess(file);
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const handleDrop = (event) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		handleFileProcess(file);
	};

	const handleCopyClick = () => {
		navigator.clipboard
			.writeText(mermaidFlowchart)
			.then(() => {
				setCopySuccess(true);
				setTimeout(() => {
					setCopySuccess(false);
				}, 2000);
			})
			.catch((error) => {
				console.error('Failed to copy:', error);
			});
	};

	const handleColorChange = (colorIndex, newColor) => {
		setCustomColors((prevColors) => ({
			...prevColors,
			[colorIndex]: newColor,
		}));
	};

	const handleCopyHex = (hex) => {
		navigator.clipboard.writeText(hex).then(() => {
			alert('Color copied to clipboard!');
		});
	};

	return (
		<>
			<div className="grid grid-rows-[auto,1fr,gap-y-0] w-full max-w-2xl px-4 py-12 items-center space-y-12">
				<div className="flex flex-col items-center space-y-2">
					<h1 className="text-2xl font-bold">JSON Canvas to Mermaid</h1>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Drag and drop a JSON Canvas file to convert it to Mermaid
					</p>
				</div>
				<div
					className="flex flex-col border border-gray-200 border-dashed rounded-lg dark:border-gray-800"
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<div
						className="grid w-full h-[200px] items-center text-center text-sm text-gray-500 dark:text-gray-400"
						style={{
							gridTemplateColumns: '1fr',
						}}
					>
						{fileName ? (
							<span className="flex items-center justify-center w-full space-x-2">
								<FileIcon className="w-6 h-6" />
								<span>{fileName}</span>
							</span>
						) : (
							<span className="flex items-center justify-center w-full space-x-2">
								<FileIcon className="w-6 h-6" />
								<span>
									Drag and drop your file here or{' '}
									<Button
										size="sm"
										onClick={() => document.getElementById('fileInput').click()}
									>
										Browse
									</Button>
								</span>
							</span>
						)}
					</div>
					{fileError && <p className="text-red-500">{fileError}</p>}
					<input
						id="fileInput"
						aria-label="File input"
						className="sr-only"
						type="file"
						accept=".canvas"
						onChange={handleFileUpload}
					/>
				</div>

				<div className="flex justify-center space-x-4">
					{Object.entries(customColors).map(([colorIndex, color]) => (
						<div
							key={colorIndex}
							className="relative"
						>
							<div
								className="w-8 h-8 rounded-full cursor-pointer"
								style={{ backgroundColor: color }}
								onClick={() => {
									setSelectedColorIndex(colorIndex);
								}}
							></div>
							<div
								className="mt-1 text-xs text-center text-gray-500 cursor-pointer"
								onClick={() => handleCopyHex(color)}
							>
								{color}
							</div>
							{selectedColorIndex === colorIndex && (
								<div className="absolute left-0 z-10 top-10">
									<div className="relative">
										<HexColorPicker
											color={color}
											onChange={(newColor) => handleColorChange(colorIndex, newColor)}
										/>
										<button
											className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
											onClick={() => setSelectedColorIndex(null)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												className="w-4 h-4"
											>
												<path
													fillRule="evenodd"
													d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				<div className="flex flex-col border border-gray-200 rounded-lg dark:border-gray-800">
					<div
						className="grid w-full p-4 text-sm text-gray-500 dark:text-gray-400"
						style={{
							gridTemplateColumns: '1fr',
						}}
					>
						<div className="flex items-center justify-center w-full space-x-2">
							<CodeIcon className="w-6 h-6" />
							<pre className="w-full overflow-auto text-left">{mermaidFlowchart}</pre>
						</div>
						<button
							className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
							onClick={handleCopyClick}
						>
							{copySuccess ? 'Copied!' : 'Copy'}
						</button>
					</div>
				</div>
				{/* <Button onClick={handleConvert}>Convert</Button>{' '} */}
			</div>
		</>
	);
}

function FileIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
			<polyline points="14 2 14 8 20 8" />
		</svg>
	);
}

function CodeIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polyline points="16 18 22 12 16 6" />
			<polyline points="8 6 2 12 8 18" />
		</svg>
	);
}
