import { Bold, Italic, Underline } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import VariableSelector from "./VariableSelector";

interface TextEditorProps {
	initialText: string;
	onTextChange: (text: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
	initialText,
	onTextChange,
}) => {
	const [text, setText] = useState(initialText);
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);

	useEffect(() => {
		onTextChange(text);
	}, [text, onTextChange]);

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		setText(newText);
		onTextChange(newText);
	};

	const handleVariableSelect = useCallback((variable: string) => {
		setText((prev) => prev + " " + variable);
	}, []);

	const toggleStyle = useCallback(
		(setter: React.Dispatch<React.SetStateAction<boolean>>) => {
			setter((prev) => !prev);
		},
		[],
	);

	return (
		<div className="bg-[#202024] rounded-md p-4">
			<div className="flex items-center space-x-2 h-[49px] border-b border-gray-700/50 mb-4">
				<button
					onClick={() => toggleStyle(setIsBold)}
					className={`p-2 rounded ${isBold ? "bg-electric/20" : "hover:bg-[#2a2a2e]"}`}
					aria-label="Toggle Bold"
				>
					<Bold size={20} className="text-white" />
				</button>
				<button
					onClick={() => toggleStyle(setIsItalic)}
					className={`p-2 rounded ${isItalic ? "bg-electric/20" : "hover:bg-[#2a2a2e]"}`}
					aria-label="Toggle Italic"
				>
					<Italic size={20} className="text-white" />
				</button>
				<button
					onClick={() => toggleStyle(setIsUnderline)}
					className={`p-2 rounded ${isUnderline ? "bg-electric/20" : "hover:bg-[#2a2a2e]"}`}
					aria-label="Toggle Underline"
				>
					<Underline size={20} className="text-white" />
				</button>
				<div className="h-6 w-px bg-gray-700/50" />
				<VariableSelector onSelectVariable={handleVariableSelect} />
			</div>
			<textarea
				id={`text-editor-${Date.now()}`}
				value={text}
				onChange={handleTextChange}
				className="w-full bg-transparent text-white resize-none focus:outline-none min-h-[100px]"
				style={{
					fontWeight: isBold ? "bold" : "normal",
					fontStyle: isItalic ? "italic" : "normal",
					textDecoration: isUnderline ? "underline" : "none",
				}}
				placeholder="Digite seu texto aqui..."
				aria-label="Text Editor"
			/>
		</div>
	);
};

export default TextEditor;
