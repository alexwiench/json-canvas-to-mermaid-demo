'use client';

import { Button } from '@/components/ui/button';
import CloseIcon from '@/components/CloseIcon';
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

import mermaid from 'mermaid';
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
	const [isFlowchartGenerated, setIsFlowchartGenerated] = useState(false);
	const colorPickerRefs = useRef({});

	const convertToMermaid = (jsonData) => {
		const mermaid = generateMermaidFlowchart(jsonData, customColors);
		setMermaidFlowchart(mermaid);
		setIsFlowchartGenerated(true);
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
		setIsFlowchartGenerated(false);
	};

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (
				selectedColorIndex !== null &&
				colorPickerRefs.current[selectedColorIndex] &&
				!colorPickerRefs.current[selectedColorIndex].contains(event.target)
			) {
				setSelectedColorIndex(null);
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [selectedColorIndex]);

	const isValidHex = (hex) => {
		const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
		return hexRegex.test(hex);
	};

	const handleHexInputChange = (colorIndex, newHex) => {
		setCustomColors((prevColors) => ({
			...prevColors,
			[colorIndex]: newHex,
		}));
	};

	const handleHexInputBlur = (colorIndex, newHex) => {
		if (isValidHex(newHex)) {
			setCustomColors((prevColors) => ({
				...prevColors,
				[colorIndex]: newHex,
			}));
		} else {
			setCustomColors((prevColors) => ({
				...prevColors,
				[colorIndex]: prevColors[colorIndex],
			}));
		}
	};

	const handleHexInputKeyDown = (event, colorIndex, newHex) => {
		if (event.key === 'Enter') {
			if (isValidHex(newHex)) {
				setCustomColors((prevColors) => ({
					...prevColors,
					[colorIndex]: newHex,
				}));
			} else {
				setCustomColors((prevColors) => ({
					...prevColors,
					[colorIndex]: prevColors[colorIndex],
				}));
			}
		}
	};

	const handleRegenerate = () => {
		if (jsonCanvas) {
			convertToMermaid(jsonCanvas);
		}
	};

	const handleRemoveFile = () => {
		setFileName('');
		setJsonCanvas(null);
		setMermaidFlowchart('');
		setIsFlowchartGenerated(false);
	};

	return (
		<>
			{/* <Head>
				<title>JSON Canvas to Mermaid</title>
				<meta
					name="description"
					content="Easily convert JSON Canvas files to Mermaid in your browser."
				/>
				<meta
					name="keywords"
					content="JSON Canvas, Mermaid, ObsidianMD"
				/>
			</Head> */}
			<div className="flex items-start justify-center min-h-screen">
				<div className="grid grid-rows-[auto,1fr,gap-y-0] w-full max-w-2xl px-4 py-12 items-center space-y-12">
					<div className="flex flex-col items-center space-y-2">
						<h1 className="text-2xl font-bold">JSON Canvas to Mermaid</h1>
						<p className="text-sm text-gray-400">
							Convert a JSON Canvas file to Mermaid in your browser.
						</p>

						<div className="flex items-center justify-center gap-4">
							<a
								href="https://github.com/alexwiench/json-canvas-to-mermaid-demo"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-blue-500 hover:underline"
							>
								Website Github
							</a>

							<a
								href="https://www.npmjs.com/package/json-canvas-to-mermaid"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-blue-500 hover:underline"
							>
								Check out the package on NPM!
							</a>
						</div>
					</div>
					<div
						className={`flex flex-col border border-gray-200 border-dashed rounded-lg dark:border-gray-800 transition-all duration-500 ease-in-out ${
							fileName ? 'h-16' : 'h-64'
						}`}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					>
						<div
							className={`grid w-full items-center text-center text-sm text-gray-500 dark:text-gray-400 transition-all duration-500 ease-in-out ${
								fileName ? 'h-16' : 'h-64'
							}`}
							style={{
								gridTemplateColumns: '1fr',
							}}
						>
							{fileName ? (
								<span className="flex items-center justify-between w-full px-4">
									<span className="flex items-center space-x-2">
										<FileIcon className="w-6 h-6" />
										<span>{fileName}</span>
									</span>
									<button
										className="text-gray-500 hover:text-gray-700 focus:outline-none"
										onClick={handleRemoveFile}
									>
										<CloseIcon className="w-4 h-4" />
									</button>
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

					{/* color picker */}

					<div className="flex flex-col items-center space-y-4">
						<h2 className="text-lg font-bold">Color Overrides</h2>
						<div className="flex justify-center space-x-4">
							{/* ... (color picker section remains the same) */}

							<div className="flex justify-center space-x-4">
								{Object.entries(customColors).map(([colorIndex, color]) => (
									<div
										key={colorIndex}
										className="flex flex-col items-center space-y-1"
									>
										<div
											className="w-8 h-8 rounded-full cursor-pointer"
											style={{ backgroundColor: color }}
											onClick={() => {
												setSelectedColorIndex(colorIndex);
											}}
										></div>
										<input
											type="text"
											className="w-20 px-2 py-1 text-xs text-center text-gray-700 bg-white border border-gray-300 rounded"
											value={color}
											onChange={(e) => handleHexInputChange(colorIndex, e.target.value)}
											onBlur={(e) => handleHexInputBlur(colorIndex, e.target.value)}
											onKeyDown={(e) => handleHexInputKeyDown(e, colorIndex, e.target.value)}
											maxLength={7}
										/>
										{selectedColorIndex === colorIndex && (
											<div
												ref={(el) => (colorPickerRefs.current[colorIndex] = el)}
												className="absolute z-10 mt-10"
											>
												<div className="relative">
													<HexColorPicker
														color={color}
														onChange={(newColor) => handleColorChange(colorIndex, newColor)}
													/>
													<button
														className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
														onClick={() => setSelectedColorIndex(null)}
													>
														<CloseIcon className="w-4 h-4" />
													</button>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="flex flex-col border border-gray-200 rounded-lg dark:border-gray-800">
						<div className="relative w-full p-4 text-sm text-gray-500 transition-all duration-500 ease-in-out dark:text-gray-400">
							{isFlowchartGenerated && fileName && (
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center space-x-2">
										<CodeIcon className="w-6 h-6" />
										<span>Output</span>
									</div>

									<button
										className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
										onClick={handleCopyClick}
									>
										{copySuccess ? 'Copied!' : 'Copy'}
									</button>
								</div>
							)}
							<div className="flex items-center justify-center w-full space-x-2">
								{isFlowchartGenerated && fileName ? (
									<>
										<div className="flex items-center justify-center w-full space-x-2">
											<pre className="w-full overflow-auto text-left opacity-0 animate-fade-in">
												{mermaidFlowchart}
											</pre>
										</div>
									</>
								) : fileName ? (
									<div className="flex items-center justify-center w-full">
										<button
											className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
											onClick={handleRegenerate}
										>
											Regenerate Flowchart
										</button>
									</div>
								) : (
									<div className="flex items-center justify-center w-full">
										<p>Please upload a file to generate the flowchart.</p>
									</div>
								)}
							</div>
						</div>
					</div>
					{isFlowchartGenerated && fileName && (
						<>
							<div className="flex justify-center mt-4">
								<a
									href="https://mermaid.live"
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm text-blue-500 hover:underline"
								>
									Try it in the Mermaid Live Editor
								</a>
							</div>
						</>
					)}
				</div>
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
